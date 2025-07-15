# GitShow

Turn your GitHub contributions into dynamic Twitter/X banner art. GitShow automatically updates your Twitter/X profile banner with a beautiful visualization of your GitHub contribution graph.

## Features

- **Automatic Updates** - Daily, weekly, or monthly banner updates
- **7 Beautiful Themes** - From classic GitHub green to dracula purple
- **Secure Authentication** - OAuth with GitHub and Twitter/X
- **Real-time Preview** - See your contribution graph before it goes live
- **Zero Configuration** - Just connect your accounts and you're ready

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Yarn 4.3.1 (Berry)
- [Browserless](https://www.browserless.io/) account for web scraping
- GitHub OAuth App
- Twitter/X API v1.1 credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/andreivcodes/gitshow.git
   cd gitshow
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Fill in your `.env` file:
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/gitshow

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-here

   # GitHub OAuth
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret

   # Twitter OAuth v1.1
   TWITTER_CONSUMER_KEY=your-twitter-key
   TWITTER_CONSUMER_SECRET=your-twitter-secret

   # Encryption
   TOKENS_SECRET=your-encryption-secret

   # Browserless
   BROWSERLESS_URL=wss://chrome.browserless.io
   BROWSERLESS_TOKEN=your-browserless-token
   ```

4. **Run database migrations**
   ```bash
   yarn workspace @gitshow/db run migrate
   ```

5. **Start the development server**
   ```bash
   yarn workspace @gitshow/web dev
   ```

6. **Start the updater service** (in a separate terminal)
   ```bash
   yarn workspace @gitshow/updater dev
   ```

Visit `http://localhost:3000` to see the app!

## Architecture

GitShow is built as a monorepo using Yarn workspaces:

```
gitshow/
├── apps/
│   ├── web/          # Next.js 15 web application
│   └── updater/      # Background job processor
└── libs/
    ├── db/           # Database layer (Kysely + PostgreSQL)
    └── gitshow-lib/  # Core logic (contribution fetching & SVG generation)
```

### Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express (updater service)
- **Database**: PostgreSQL with Kysely ORM
- **Authentication**: NextAuth.js
- **Web Scraping**: Puppeteer + Browserless
- **Image Processing**: Sharp
- **Scheduling**: node-schedule

## Available Themes

Choose from 7 beautiful themes for your contribution graph:

- **Normal** - Classic GitHub green
- **Classic** - Lighter green variant
- **GitHub Dark** - Dark mode with bright accents
- **Dracula** - Purple and pink
- **Black & White** - Minimalist monochrome
- **Spooky** - Halloween orange
- **Winter** - Cool blue tones

## Development

### Commands

```bash
# Build everything
yarn build-lib && yarn build-web && yarn build-updater

# Development mode
yarn workspace @gitshow/web dev

# Linting
yarn workspace @gitshow/web lint

# Update dependencies
./update_deps.sh
```

### Project Structure

- **Authentication Flow**: Users must connect both GitHub and Twitter/X accounts with matching email addresses
- **Data Flow**: GitHub contributions are scraped hourly, cached in PostgreSQL, and processed into SVG visualizations
- **Job Queue**: Background jobs handle banner updates based on user preferences
- **Security**: OAuth tokens are AES encrypted before database storage
