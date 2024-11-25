// src/app/api/fetch-raw-articles/route.js

import Parser from "rss-parser";

const parser = new Parser();

// Initialize global articles array if it doesn't exist
if (!global.rawArticles) {
  global.rawArticles = [];
}

export async function GET() {
  try {
    const newArticles = [];
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Use global.rssFeeds
    if (!global.rssFeeds || global.rssFeeds.length === 0) {
      return new Response(
        JSON.stringify({
          articles: [],
          message: "No RSS feeds configured",
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
          const exists = global.rawArticles.find(
            (article) => article.link === item.link
          );
          if (exists) {
            newArticles.push(exists);
            continue;
          }

          const newArticle = {
            id: global.rawArticles.length + newArticles.length + 1,
            title: item.title,
            contentSnippet: item.contentSnippet || "",
            link: item.link,
            pubDate: item.pubDate,
            isRead: false,
          };

          global.rawArticles.push(newArticle);
          newArticles.push(newArticle);
        }
      } catch (feedError) {
        console.error(`Error processing feed ${feedUrl}:`, feedError);
      }
    }

    // Sort articles by publication date (newest first)
    newArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    return new Response(
      JSON.stringify({
        articles: newArticles,
        debug: {
          feedsCount: global.rssFeeds.length,
          newArticlesCount: newArticles.length,
          totalStoredArticles: global.rawArticles.length,
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
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
