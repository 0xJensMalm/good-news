// src/app/api/mark-read/route.js

let articles = []; // This should ideally come from a database

export async function POST(request) {
  try {
    const { articleId } = await request.json();

    if (!articleId) {
      return new Response(
        JSON.stringify({ success: false, message: "Article ID is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Find the article by ID
    const article = articles.find((a) => a.id === articleId);

    if (!article) {
      return new Response(
        JSON.stringify({ success: false, message: "Article not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Mark as read
    article.isRead = true;

    return new Response(JSON.stringify({ success: true, article }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
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
