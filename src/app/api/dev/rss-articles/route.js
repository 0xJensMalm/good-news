import Parser from "rss-parser";

const parser = new Parser();

export async function GET() {
  try {
    const articles = [];
    const feeds = global.rssFeeds || [];

    for (const feedUrl of feeds) {
      try {
        const feed = await parser.parseURL(feedUrl);
        articles.push(...feed.items.slice(0, 20)); // Get first 20 articles from each feed
      } catch (error) {
        console.error(`Error fetching feed ${feedUrl}:`, error);
      }
    }

    // Return up to 100 most recent articles
    const recentArticles = articles
      .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
      .slice(0, 100);

    return new Response(JSON.stringify({ articles: recentArticles }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
