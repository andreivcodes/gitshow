# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GitShow is a Next.js application that creates visual representations of GitHub contributions and automatically updates Twitter/X profile banners. It uses Vercel Workflow DevKit for background job processing.

**Key Features:**

- Scrapes GitHub contribution graphs using Puppeteer via Browserless
- Generates SVG visualizations with 14 themes
- Converts SVGs to JPEG and uploads as Twitter/X banners
- Supports automatic daily/weekly/monthly updates via Workflow DevKit
- Requires dual authentication (GitHub + Twitter with matching emails)

## Development Commands

```bash
# Build the project
pnpm build

# Development
pnpm dev        # Run with Turbopack

# Database
pnpm db:migrate  # Run migrations
pnpm db:gen      # Generate Kysely types from DB

# Linting
pnpm lint
```

## Architecture

This is a single Next.js 16 application with App Router.

### Directory Structure

- `src/app/` - Next.js app router pages and API routes
- `src/components/ui/` - UI components (shadcn/ui pattern)
- `src/components/app/` - App-specific components
- `src/lib/db/` - Database layer using Kysely ORM
- `src/lib/gitshow/` - Core business logic (scraping, SVG generation, themes)
- `src/workflows/` - Vercel Workflow DevKit workflows

### Database

Uses Kysely ORM with PostgreSQL:

- Tables: `user`
- Migrations in `src/lib/db/migrations/`
- Exports: `db`, `RefreshInterval`, `encryptToken`, `decryptToken`

### Core Business Logic

Located in `src/lib/gitshow/`:

- `contributions-scraper.ts` - Puppeteer scraping logic via Browserless
- `contributions-svg.ts` - SVG generation (7x53 grid)
- `themes.ts` - All 14 theme definitions

### Background Jobs

Uses Vercel Workflow DevKit with Local World for job processing:

- `src/workflows/banner-updater.ts` - Long-running workflow for banner updates
- Runs continuously with 1-hour intervals
- Processes users needing banner refreshes based on their update interval

### Key Technical Patterns

1. **Dual Authentication**: Both GitHub and Twitter accounts must share the same email. `fullyAuthenticated` is true only when both providers are connected. Tokens are AES encrypted before database storage.

2. **Workflow Processing**: Uses Vercel Workflow DevKit with Local World for state management. Long-running workflow with `while(true)` + `sleep("1 hour")` pattern.

3. **Contribution Data Flow**:
   - Scrape via Browserless → Parse HTML → Generate SVG → Convert to JPEG via Sharp → Upload to Twitter API v1.1

### Key Files

- `src/lib/gitshow/themes.ts` - All 14 theme definitions (normal, classic, githubDark, dracula, bnw, spooky, winter, christmas, ocean, sunset, forest, neon, candy, fire)
- `src/lib/gitshow/contributions-scraper.ts` - Puppeteer scraping logic
- `src/lib/gitshow/contributions-svg.ts` - SVG generation
- `src/lib/auth.ts` - NextAuth configuration with dual-auth logic
- `src/workflows/banner-updater.ts` - Workflow for automatic banner updates

### Environment Variables

Required:

- `DATABASE_URL` - PostgreSQL connection string
- `TOKENS_SECRET` - AES encryption key for stored tokens
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- `TWITTER_CONSUMER_KEY`, `TWITTER_CONSUMER_SECRET`
- `BROWSERLESS_URL`, `BROWSERLESS_TOKEN`
