# 📰 PositiveNews Feed

A news aggregator that uses AI to filter and display positive news from multiple RSS feeds. Built with Next.js and OpenAI's GPT-4.

## 🌟 Features

- **RSS Feed Aggregation**: Collect news from multiple RSS sources
- **AI-Powered Filtering**: Uses GPT-4 to identify and filter positive news stories
- **Real-time Updates**: Refreshes automatically every 5 minutes
- **Developer Console**: Built-in debugging tools for monitoring feed and AI behavior
- **Read Status Tracking**: Keep track of articles you've already read
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- NPM or Yarn
- OpenAI API key

### Installation

1. Clone the repository:

```bash
git clone https://your-repository-url/positive-news.git
cd positive-news
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.template .env
```

Edit `.env` and add your OpenAI API key:

```
OPENAI_API_KEY=your_key_here
```

4. Run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🔧 Usage

### Adding RSS Feeds

Enter RSS feed URLs in the top navigation bar. Some recommended feeds:

- `https://feeds.bbci.co.uk/news/world/rss.xml`
- `https://rss.nytimes.com/services/xml/rss/nyt/World.xml`
- `https://www.positive.news/feed/`
- `https://feeds.a.dj.com/rss/RSSWorldNews.xml`

### Using the AI Filter

1. By default, all articles from your feeds are displayed
2. Click the "✨ Magical Positive AI Filter ✨" button to activate AI filtering
3. The AI will analyze articles and show only those with positive content
4. Click again to disable the filter and see all articles

### Developer Console

Access the developer console by clicking "Show Dev Console" in the bottom right:

- **RSS List**: View current RSS feeds
- **RSS Articles**: View raw articles before AI filtering
- **Test AI Filter**: Monitor the AI filtering process

## 🛠 Technical Stack

- **Frontend**: Next.js, React
- **API**: Next.js API Routes
- **RSS Parsing**: rss-parser
- **AI Integration**: OpenAI GPT-4
- **HTTP Client**: Axios
- **State Management**: React Hooks

## 📁 Project Structure

```
positive-news/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── add-feed/
│   │   │   ├── fetch-articles/
│   │   │   ├── fetch-raw-articles/
│   │   │   ├── mark-read/
│   │   │   └── dev/
│   │   ├── page.js
│   │   └── layout.js
│   └── components/
│       └── DevConsole.js
├── .env
├── .env.template
├── .gitignore
└── package.json
```

## 🔄 Development Workflow

1. Articles are fetched from RSS feeds every 5 minutes
2. New articles are stored in memory (consider adding database for production)
3. When AI filter is active:
   - Articles are sent to OpenAI in batches
   - GPT-4 analyzes sentiment and identifies positive content
   - Only positive articles are displayed
4. Read status is maintained across filter toggles

## ⚠️ Limitations

- In-memory storage (resets on server restart)
- Limited to recent articles (24 hours)
- API rate limits apply
- Token limits for AI analysis

## 🚧 Future Improvements

- [ ] Database integration for persistent storage
- [ ] User authentication and personal feed management
- [ ] Customizable AI filtering criteria
- [ ] Category-based filtering
- [ ] Share functionality
- [ ] Export capabilities
- [ ] Mobile app

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
