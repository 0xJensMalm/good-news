if (!global.rssFeeds) {
  global.rssFeeds = [
    "https://feeds.bbci.co.uk/news/world/rss.xml",
    "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    "https://feeds.a.dj.com/rss/RSSWorldNews.xml",
    "https://www.positive.news/feed/",
  ];
}

export async function POST(request) {
  try {
    const { rssUrl } = await request.json();

    if (!rssUrl) {
      return new Response(
        JSON.stringify({ success: false, message: "RSS URL is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Prevent duplicate feeds
    if (!global.rssFeeds.includes(rssUrl)) {
      global.rssFeeds.push(rssUrl);
    }

    return new Response(
      JSON.stringify({ success: true, feeds: global.rssFeeds }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function GET() {
  return new Response(JSON.stringify({ feeds: global.rssFeeds }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
