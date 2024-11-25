// src/app/api/fetch-articles/route.js

import Parser from "rss-parser";
import OpenAI from "openai";

const parser = new Parser();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize global articles array if it doesn't exist
if (!global.articles) {
  global.articles = [];
}

async function analyzeArticleSentiment(articles) {
  try {
    const prompt = `Analyze these news articles and identify which have a positive tone or convey positive news. Return ONLY a JSON array of indices for positive articles.

Articles:
${articles
  .map(
    (article, index) =>
      `${index}. Title: ${article.title}\nDescription: ${
        article.contentSnippet || ""
      }\n`
  )
  .join("\n")}

RESPOND WITH ONLY A JSON ARRAY LIKE [0,1,4]. NO OTHER TEXT.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content:
            "You are a news sentiment analyzer. Your task is to return ONLY a JSON array of indices for positive articles. No explanation, no additional text, just the array. Example response: [0,1,4]",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 150,
    });

    const rawResponse = response.choices[0].message.content.trim();

    try {
      // Try direct parsing first
      return JSON.parse(rawResponse);
    } catch (parseError) {
      // If that fails, try to extract array from response
      const arrayMatch = rawResponse.match(/\[.*?\]/);
      if (arrayMatch) {
        try {
          const indices = JSON.parse(arrayMatch[0]);
          if (Array.isArray(indices)) {
            return indices;
          }
        } catch {}
      }
      console.error("Could not parse OpenAI response:", rawResponse);
      return [];
    }
  } catch (error) {
    console.error("Error in sentiment analysis:", error);
    return [];
  }
}

export async function GET() {
  try {
    const newArticles = [];
    const articlesToAnalyze = [];
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Use global.rssFeeds
    if (!global.rssFeeds || global.rssFeeds.length === 0) {
      return new Response(
        JSON.stringify({
          articles: [],
          message: "No RSS feeds configured",
          debug: { feedsCount: 0 },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Fetch articles from all feeds
    for (const feedUrl of global.rssFeeds) {
      try {
        const feed = await parser.parseURL(feedUrl);
        const recentArticles = feed.items
          .filter((item) => new Date(item.pubDate) > last24Hours)
          .slice(0, 10); // Take up to 10 recent articles per feed

        for (const item of recentArticles) {
          // Check if article already exists
          const exists = global.articles.find(
            (article) => article.link === item.link
          );
          if (exists) {
            newArticles.push(exists);
            continue;
          }

          articlesToAnalyze.push({
            title: item.title,
            contentSnippet: item.contentSnippet || "",
            link: item.link,
            pubDate: item.pubDate,
          });
        }
      } catch (feedError) {
        console.error(`Error processing feed ${feedUrl}:`, feedError);
      }
    }

    if (articlesToAnalyze.length > 0) {
      // Process articles in batches of 10 to avoid token limits
      const batchSize = 10;
      for (let i = 0; i < articlesToAnalyze.length; i += batchSize) {
        const batch = articlesToAnalyze.slice(i, i + batchSize);
        const positiveIndices = await analyzeArticleSentiment(batch);

        // Add positive articles from this batch
        positiveIndices.forEach((index) => {
          if (index < batch.length) {
            // Verify index is valid
            const item = batch[index];
            const newArticle = {
              id: global.articles.length + newArticles.length + 1,
              ...item,
              isRead: false,
            };
            global.articles.push(newArticle);
            newArticles.push(newArticle);
          }
        });
      }
    }

    // Sort articles by publication date (newest first)
    newArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    // Return debug information along with articles
    return new Response(
      JSON.stringify({
        articles: newArticles,
        debug: {
          feedsCount: global.rssFeeds.length,
          newArticlesCount: newArticles.length,
          analyzedCount: articlesToAnalyze.length,
          totalStoredArticles: global.articles.length,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in GET request:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        debug: {
          errorLocation: "main GET handler",
          errorStack: error.stack,
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
