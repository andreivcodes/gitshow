# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GitShow is a monorepo that creates visual representations of GitHub contributions and automatically updates Twitter/X profile banners. It consists of a Next.js web app, a background updater service, and shared libraries.

**Key Features:**
- Scrapes GitHub contribution graphs using Puppeteer via Browserless
- Generates SVG visualizations with 14 themes
- Converts SVGs to JPEG and uploads as Twitter/X banners
- Supports automatic daily/weekly/monthly updates
- Requires dual authentication (GitHub + Twitter with matching emails)

## Development Commands

```bash
# Build the entire project
pnpm build-lib && pnpm build-web && pnpm build-updater

# Build individual workspaces
pnpm build-lib      # Build shared library (required before web/updater)
pnpm build-web      # Build web application
pnpm build-updater  # Build updater service

# Development
pnpm --filter @gitshow/web dev        # Run web app with Turbopack
pnpm --filter @gitshow/updater start  # Run updater service

# Database
pnpm --filter @gitshow/db migrate     # Run migrations
pnpm --filter @gitshow/db db:gen      # Generate Kysely types from DB

# Linting
pnpm --filter @gitshow/web lint

# Dependency management
./update_deps.sh    # Update and sync dependencies using syncpack
```

## Architecture

This is a pnpm workspace monorepo (`libs/*` and `apps/*`).

### Apps

**web/** - Next.js 16 application with App Router
- NextAuth for authentication (GitHub/Twitter OAuth)
- Server components and API routes pattern
- UI components in `src/components/ui/` (shadcn/ui pattern)
- App-specific components in `src/components/app/`

**updater/** - Node.js service for scheduled Twitter banner updates
- Hourly job: Creates queue entries for users needing updates
- Every-minute job: Processes up to 5 pending jobs concurrently
- Uses PostgreSQL advisory locks for multi-instance safety
- Exposes `/health` endpoint for healthchecks

### Libraries

**@gitshow/db** - Database layer using Kysely ORM
- PostgreSQL with camelCase column mapping
- Tables: `user`, `jobQueue`
- Migrations in `migrations/`
- Exports: `db`, `RefreshInterval`, `encryptToken`, `decryptToken`

**@gitshow/gitshow-lib** - Core business logic
- `scrapeContributions()` - Fetches GitHub data via Puppeteer
- `renderContribSvg()` - Generates SVG from contribution data
- Exports all theme definitions from `themes.ts`

### Key Technical Patterns

1. **Dual Authentication**: Both GitHub and Twitter accounts must share the same email. `fullyAuthenticated` is true only when both providers are connected. Tokens are AES encrypted before database storage.

2. **Job Processing**: Uses PostgreSQL advisory locks (`pg_try_advisory_lock`) for atomic job claiming across multiple instances. Jobs have `pending`, `processed`, or `failed` status.

3. **Contribution Data Flow**:
   - Scrape via Browserless → Parse HTML → Generate SVG → Convert to JPEG via Sharp → Upload to Twitter API v1.1

### Key Files

- `libs/gitshow-lib/src/themes.ts` - All 14 theme definitions (normal, classic, githubDark, dracula, bnw, spooky, winter, christmas, ocean, sunset, forest, neon, candy, fire)
- `libs/gitshow-lib/src/utils/contributions_scraper.ts` - Puppeteer scraping logic
- `libs/gitshow-lib/src/utils/contributions_svg.ts` - SVG generation (7x53 grid)
- `apps/web/src/lib/auth.ts` - NextAuth configuration with dual-auth logic
- `apps/updater/src/index.ts` - Scheduled jobs and Twitter API integration

### Environment Variables

Required for all services:
- `DATABASE_URL` - PostgreSQL connection string
- `TOKENS_SECRET` - AES encryption key for stored tokens

Web app additionally requires:
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- `TWITTER_CONSUMER_KEY`, `TWITTER_CONSUMER_SECRET`

Updater/scraping additionally requires:
- `BROWSERLESS_URL`, `BROWSERLESS_TOKEN`
