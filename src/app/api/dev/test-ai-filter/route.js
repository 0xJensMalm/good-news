// src/app/api/dev/test-ai-filter/route.js

import Parser from "rss-parser";
import OpenAI from "openai";

const parser = new Parser();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "", // Add fallback to empty string
});

export async function GET() {
  const steps = [];
  try {
    // Step 1: Check OpenAI API key
    steps.push({ message: "1. Checking OpenAI API key...", type: "info" });
    if (!process.env.OPENAI_API_KEY) {
      steps.push({
        message:
          "Error: OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env file",
        type: "error",
      });
      throw new Error("OpenAI API key not configured");
    }
    steps.push({ message: "OpenAI API key found", type: "success" });

    // Step 2: Check RSS feeds
    steps.push({ message: "2. Checking RSS feeds...", type: "info" });
    if (!global.rssFeeds || global.rssFeeds.length === 0) {
      steps.push({ message: "No RSS feeds found", type: "error" });
      throw new Error("No RSS feeds configured");
    }
    steps.push({
      message: `Found ${global.rssFeeds.length} RSS feeds`,
      type: "success",
    });

    // Step 3: Fetch articles
    steps.push({
      message: "3. Fetching articles from RSS feeds...",
      type: "info",
    });
    const articles = [];

    for (const feedUrl of global.rssFeeds) {
      try {
        const feed = await parser.parseURL(feedUrl);
        const recentArticles = feed.items.slice(0, 5); // Get 5 articles for testing
        articles.push(...recentArticles);
        steps.push({
          message: `Retrieved ${recentArticles.length} articles from ${feedUrl}`,
          type: "success",
        });
      } catch (error) {
        steps.push({
          message: `Error fetching from ${feedUrl}: ${error.message}`,
          type: "error",
        });
      }
    }

    if (articles.length === 0) {
      steps.push({ message: "No articles found in feeds", type: "error" });
      throw new Error("No articles found");
    }

    // Step 4: Prepare OpenAI prompt
    steps.push({ message: "4. Preparing OpenAI prompt...", type: "info" });
    const articlesForAnalysis = articles.map((article) => ({
      title: article.title || "",
      description: article.contentSnippet || article.content || "",
    }));

    const prompt = `Analyze these news articles and identify which ones have a positive tone or convey positive news. Return only the indices of positive articles as a JSON array.

Articles:
${articlesForAnalysis
  .map(
    (article, index) =>
      `${index}. Title: ${article.title}\nDescription: ${article.description}\n`
  )
  .join("\n")}

Return ONLY a JSON array of indices, e.g. [0, 2, 4]`;

    steps.push({
      message: `Prompt prepared with ${articles.length} articles`,
      type: "success",
    });

    // Step 5: Call OpenAI API
    steps.push({ message: "5. Calling OpenAI API...", type: "info" });

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
          content: `Analyze these news articles and identify which have a positive tone or convey positive news. Return ONLY a JSON array of indices for positive articles.

Articles:
${articles
  .map(
    (article, index) =>
      `${index}. Title: ${article.title}\nDescription: ${
        article.contentSnippet || article.content || ""
      }\n`
  )
  .join("\n")}

RESPOND WITH ONLY A JSON ARRAY LIKE [0,1,4]. NO OTHER TEXT.`,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent output
      max_tokens: 150,
    });

    steps.push({
      message: "Raw OpenAI response: " + response.choices[0].message.content,
      type: "info",
    });

    // Better response parsing
    let positiveIndices;
    const rawResponse = response.choices[0].message.content.trim();

    try {
      // Try to parse the raw response
      positiveIndices = JSON.parse(rawResponse);
    } catch (parseError) {
      // If parsing fails, try to extract array from the response
      const arrayMatch = rawResponse.match(/\[.*?\]/);
      if (arrayMatch) {
        try {
          positiveIndices = JSON.parse(arrayMatch[0]);
        } catch {
          throw new Error("Could not parse OpenAI response into array");
        }
      } else {
        throw new Error("OpenAI response did not contain a valid array");
      }
    }

    // Validate that we got an array of numbers
    if (!Array.isArray(positiveIndices)) {
      throw new Error("OpenAI did not return an array");
    }

    steps.push({
      message: `Found ${
        positiveIndices.length
      } positive articles: ${JSON.stringify(positiveIndices)}`,
      type: "success",
    });

    // Return all steps
    return new Response(JSON.stringify({ success: true, steps }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    steps.push({
      message: `Error: ${error.message}`,
      type: "error",
    });

    return new Response(
      JSON.stringify({
        success: false,
        steps,
        error: error.message,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
