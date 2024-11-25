// src/components/Navbar.js

"use client";

import { useState } from "react";
import axios from "axios";

export default function Navbar({ onNewFeed }) {
  const [rssUrl, setRssUrl] = useState("");

  const handleAddFeed = async () => {
    if (!rssUrl) {
      alert("Please enter a valid RSS feed URL.");
      return;
    }
    try {
      const response = await axios.post("/api/add-feed", { rssUrl });
      if (response.data.success) {
        onNewFeed(response.data.feeds);
        setRssUrl("");
      } else {
        alert("Failed to add RSS feed.");
      }
    } catch (error) {
      console.error("Error adding feed:", error);
      alert("An error occurred while adding the RSS feed.");
    }
  };

  return (
    <nav style={styles.nav}>
      <h1>PositiveNews</h1>
      <div>
        <input
          type="text"
          placeholder="Add RSS Feed URL"
          value={rssUrl}
          onChange={(e) => setRssUrl(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleAddFeed} style={styles.button}>
          Add
        </button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "white",
  },
  input: {
    padding: "5px",
    marginRight: "10px",
    width: "300px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "5px 10px",
    backgroundColor: "#fff",
    color: "#4CAF50",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
