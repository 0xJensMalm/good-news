// src/app/page.js

"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import DevConsole from "../components/DevConsole";

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
  },
  nav: {
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e5e5",
    padding: "1rem",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  navContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: 0,
  },
  inputGroup: {
    display: "flex",
    gap: "1rem",
  },
  input: {
    padding: "0.5rem 1rem",
    border: "1px solid #e5e5e5",
    borderRadius: "0.375rem",
    width: "300px",
    fontSize: "0.875rem",
  },
  button: {
    padding: "0.5rem 1rem",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "0.375rem",
    cursor: "pointer",
    fontSize: "0.875rem",
  },
  main: {
    maxWidth: "1200px",
    margin: "2rem auto",
    padding: "0 1rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1.5rem",
    padding: "1rem",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "0.5rem",
    padding: "1.5rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  cardRead: {
    backgroundColor: "#f8f8f8",
  },
  cardHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  cardTitle: {
    fontSize: "1.125rem",
    fontWeight: "600",
    marginBottom: "0.5rem",
    color: "#1a1a1a",
  },
  cardLink: {
    textDecoration: "none",
    color: "inherit",
  },
  cardDate: {
    fontSize: "0.875rem",
    color: "#666666",
    marginBottom: "1rem",
  },
  cardContent: {
    fontSize: "0.875rem",
    color: "#4a4a4a",
    marginBottom: "1rem",
  },
  readButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "0.375rem",
    cursor: "pointer",
    fontSize: "0.75rem",
  },
  loading: {
    textAlign: "center",
    padding: "2rem",
    color: "#666666",
  },
  empty: {
    textAlign: "center",
    padding: "2rem",
    color: "#666666",
    backgroundColor: "white",
    borderRadius: "0.5rem",
    marginTop: "2rem",
  },
  aiButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#8B5CF6", // Purple color for AI button
    color: "white",
    border: "none",
    borderRadius: "0.375rem",
    cursor: "pointer",
    fontSize: "0.875rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    transition: "all 0.2s",
    boxShadow: "0 2px 4px rgba(139, 92, 246, 0.3)",
  },
  aiButtonActive: {
    backgroundColor: "#7C3AED", // Darker purple when active
    transform: "scale(0.98)",
  },
  aiSparkle: {
    fontSize: "1.2em",
  },
  controls: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  articleCount: {
    fontSize: "0.875rem",
    color: "#666666",
  },
};

export default function Home() {
  const [feeds, setFeeds] = useState([]);
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiActive, setAiActive] = useState(false);
  const [newFeedUrl, setNewFeedUrl] = useState("");

  const fetchArticles = async (useAI = false) => {
    setLoading(true);
    try {
      // If AI is active, use the existing endpoint, otherwise use a new one
      const endpoint = useAI
        ? "/api/fetch-articles"
        : "/api/fetch-raw-articles";
      const response = await axios.get(endpoint);
      if (useAI) {
        setFilteredArticles(response.data.articles);
      } else {
        setArticles(response.data.articles);
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
    setLoading(false);
  };

  const handleAIToggle = async () => {
    setAiActive((prev) => !prev);
    setLoading(true);
    await fetchArticles(!aiActive);
  };

  const handleAddFeed = async () => {
    if (!newFeedUrl) return;

    try {
      const response = await axios.post("/api/add-feed", {
        rssUrl: newFeedUrl,
      });
      if (response.data.success) {
        setFeeds(response.data.feeds);
        setNewFeedUrl("");
        fetchArticles(aiActive);
      }
    } catch (error) {
      console.error("Error adding feed:", error);
    }
  };

  const markAsRead = async (id) => {
    try {
      const response = await axios.post("/api/mark-read", { articleId: id });
      if (response.data.success) {
        const updateArticles = (arr) =>
          arr.map((article) =>
            article.id === id ? { ...article, isRead: true } : article
          );

        setArticles(updateArticles);
        setFilteredArticles(updateArticles);
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  useEffect(() => {
    fetchArticles(false);
    const interval = setInterval(() => fetchArticles(aiActive), 300000);
    return () => clearInterval(interval);
  }, []);

  const displayedArticles = aiActive ? filteredArticles : articles;

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <div style={styles.navContent}>
          <div style={styles.controls}>
            <h1 style={styles.title}>PositiveNews</h1>
            <button
              onClick={handleAIToggle}
              style={{
                ...styles.aiButton,
                ...(aiActive && styles.aiButtonActive),
              }}
            >
              <span style={styles.aiSparkle}>✨</span>
              Magical Positive AI Filter
              <span style={styles.aiSparkle}>✨</span>
            </button>
            <span style={styles.articleCount}>
              {displayedArticles.length} articles
            </span>
          </div>
          <div style={styles.inputGroup}>
            <input
              type="url"
              placeholder="Add RSS Feed URL"
              value={newFeedUrl}
              onChange={(e) => setNewFeedUrl(e.target.value)}
              style={styles.input}
            />
            <button onClick={handleAddFeed} style={styles.button}>
              Add Feed
            </button>
          </div>
        </div>
      </nav>

      <main style={styles.main}>
        {loading ? (
          <div style={styles.loading}>
            {aiActive ? "AI is analyzing articles..." : "Loading articles..."}
          </div>
        ) : displayedArticles.length === 0 ? (
          <div style={styles.empty}>
            <p>
              {aiActive
                ? "No positive articles found. Try disabling the AI filter to see all articles."
                : "No articles found. Add some RSS feeds to get started!"}
            </p>
          </div>
        ) : (
          <div style={styles.grid}>
            {displayedArticles.map((article) => (
              <article
                key={article.id}
                style={{
                  ...styles.card,
                  ...(article.isRead && styles.cardRead),
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                }}
              >
                <h2 style={styles.cardTitle}>
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.cardLink}
                  >
                    {article.title}
                  </a>
                </h2>
                <div style={styles.cardDate}>
                  {new Date(article.pubDate).toLocaleDateString()}
                </div>
                <p style={styles.cardContent}>{article.contentSnippet}</p>
                {!article.isRead && (
                  <button
                    onClick={() => markAsRead(article.id)}
                    style={styles.readButton}
                  >
                    Mark as Read
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </main>
      <DevConsole />
    </div>
  );
}
