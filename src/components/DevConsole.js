// src/components/DevConsole.js
"use client";

import { useState } from "react";
import axios from "axios";

const styles = {
  consoleWrapper: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "600px",
    height: "400px",
    backgroundColor: "#1e1e1e",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    padding: "8px 12px",
    backgroundColor: "#333",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    margin: 0,
    fontSize: "14px",
    fontFamily: "monospace",
  },
  closeButton: {
    background: "none",
    border: "none",
    color: "white",
    cursor: "pointer",
    fontSize: "16px",
  },
  buttonBar: {
    padding: "8px",
    backgroundColor: "#252525",
    display: "flex",
    gap: "8px",
  },
  button: {
    padding: "6px 12px",
    backgroundColor: "#0e639c",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    fontFamily: "monospace",
  },
  console: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    color: "#d4d4d4",
    fontFamily: "monospace",
    fontSize: "12px",
    padding: "12px",
    overflow: "auto",
    whiteSpace: "pre-wrap",
  },
  logEntry: {
    margin: "4px 0",
    borderLeft: "3px solid",
    paddingLeft: "8px",
  },
  logInfo: {
    borderColor: "#0e639c",
  },
  logError: {
    borderColor: "#f48771",
    color: "#f48771",
  },
  logSuccess: {
    borderColor: "#89d185",
    color: "#89d185",
  },
  toggleButton: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    padding: "8px 16px",
    backgroundColor: "#333",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    zIndex: 999,
  },
};

export default function DevConsole() {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { message, type, timestamp }]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getRssFeeds = async () => {
    addLog("Fetching RSS feeds list...", "info");
    try {
      const response = await axios.get("/api/dev/rss-list");
      addLog("RSS Feeds:", "info");
      addLog(JSON.stringify(response.data.feeds, null, 2), "success");
    } catch (error) {
      addLog(`Error fetching RSS feeds: ${error.message}`, "error");
    }
  };

  const getRssArticles = async () => {
    addLog("Fetching raw RSS articles...", "info");
    try {
      const response = await axios.get("/api/dev/rss-articles");
      addLog(`Found ${response.data.articles.length} articles`, "info");
      addLog(
        JSON.stringify(response.data.articles.slice(0, 5), null, 2),
        "success"
      );
      addLog(`... ${response.data.articles.length - 5} more articles`, "info");
    } catch (error) {
      addLog(`Error fetching articles: ${error.message}`, "error");
    }
  };

  const testAiFilter = async () => {
    addLog("Starting AI filtering process...", "info");
    try {
      const response = await axios.get("/api/dev/test-ai-filter");
      addLog("AI Processing Steps:", "info");
      response.data.steps.forEach((step) => {
        addLog(step.message, step.type);
      });
    } catch (error) {
      addLog(`Error in AI filtering: ${error.message}`, "error");
    }
  };

  return (
    <>
      {!isVisible && (
        <button style={styles.toggleButton} onClick={() => setIsVisible(true)}>
          Show Dev Console
        </button>
      )}

      {isVisible && (
        <div style={styles.consoleWrapper}>
          <div style={styles.header}>
            <h3 style={styles.title}>Developer Console</h3>
            <button
              style={styles.closeButton}
              onClick={() => setIsVisible(false)}
            >
              ×
            </button>
          </div>

          <div style={styles.buttonBar}>
            <button style={styles.button} onClick={getRssFeeds}>
              RSS List
            </button>
            <button style={styles.button} onClick={getRssArticles}>
              RSS Articles
            </button>
            <button style={styles.button} onClick={testAiFilter}>
              Test AI Filter
            </button>
            <button style={styles.button} onClick={clearLogs}>
              Clear
            </button>
          </div>

          <div style={styles.console}>
            {logs.map((log, index) => (
              <div
                key={index}
                style={{
                  ...styles.logEntry,
                  ...styles[
                    `log${log.type.charAt(0).toUpperCase() + log.type.slice(1)}`
                  ],
                }}
              >
                [{log.timestamp}] {log.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
