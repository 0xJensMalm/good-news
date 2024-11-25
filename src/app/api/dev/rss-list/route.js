// src/app/api/dev/rss-list/route.js
export async function GET() {
  try {
    // Access the RSS feeds from your existing route
    return new Response(JSON.stringify({ feeds: global.rssFeeds || [] }), {
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
