# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GitShow is a monorepo that creates visual representations of GitHub contributions and automatically updates social media profiles. It consists of a Next.js web app, a background updater service, and shared libraries.

**Key Features:**
- Scrapes GitHub contribution graphs using Puppeteer
- Generates SVG visualizations with 7 different themes
- Converts SVGs to JPEG and uploads as Twitter/X banners
- Supports automatic daily/weekly/monthly updates
- Requires dual authentication (GitHub + Twitter with matching emails)

## Development Commands

### Build Commands
```bash
# Build the entire project
pnpm build-lib && pnpm build-web && pnpm build-updater

# Build individual workspaces
pnpm build-lib      # Build shared library
pnpm build-web      # Build web application  
pnpm build-updater  # Build updater service

# Development
pnpm --filter @gitshow/web dev  # Run web app in development mode
pnpm --filter @gitshow/updater dev  # Run updater in development mode
```

### Database Commands
```bash
pnpm --filter @gitshow/db migrate  # Run database migrations
```

### Linting
```bash
pnpm --filter @gitshow/web lint  # Lint the web application
```

### Start Services
```bash
pnpm start-web      # Start web application (production)
pnpm start-updater  # Start updater service (production)
```

### Dependency Management
```bash
./update_deps.sh    # Update and sync dependencies across workspaces using syncpack
```

## Architecture

This is a pnpm workspace monorepo with the following structure:

### Apps Layer
- **web/**: Next.js 15 application with App Router
  - Uses NextAuth for authentication (GitHub/Twitter OAuth)
  - No Stripe integration (dependencies exist but not used)
  - Server components and API routes pattern
  - 3D tilt effect on contribution cards (desktop only)
  
- **updater/**: Node.js service for scheduled Twitter profile updates
  - Runs two scheduled jobs:
    - Hourly: Creates jobs for users needing updates
    - Every minute: Processes up to 5 pending jobs concurrently

### Libraries Layer  
- **@gitshow/db**: Database abstraction using Kysely ORM
  - PostgreSQL database with migrations in `libs/db/migrations/`
  - Two tables: `user` and `jobQueue`
  - Provides type-safe database queries with camelCase mapping
  
- **@gitshow/gitshow-lib**: Core business logic
  - GitHub contributions data fetching via Puppeteer + Browserless
  - SVG generation with 7 themes (normal, classic, githubDark, dracula, bnw, spooky, winter)
  - 1-hour cache for contribution data
  - Sharp for SVG to JPEG conversion

### Key Technical Patterns

1. **Dual Authentication Requirement**: 
   - Both GitHub and Twitter accounts must have the same email
   - `fullyAuthenticated` flag only true when both providers connected
   - Tokens are AES encrypted before database storage

2. **Database Schema**:
   - `user` table: Stores auth tokens, preferences, and cached contribution data
   - `jobQueue` table: Manages background processing jobs
   - Uses JSONB for contribution data storage

3. **Background Job Processing**:
   - Mutex flag ensures atomic processing
   - Exponential backoff for GitHub scraping retries
   - Updates `lastUpdateTimestamp` on successful banner update

4. **UI Components**: 
   - Uses shadcn/ui pattern with Radix UI primitives in `src/components/ui/`
   - Custom 3D tilt effect in contributions component
   - Skeleton loading states throughout

5. **Environment Variables Required**:
   - DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET
   - GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
   - TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET
   - TOKENS_SECRET (for AES encryption)
   - BROWSERLESS_URL, BROWSERLESS_TOKEN

### Important Files and Their Purposes

- `apps/web/src/app/(components)/contributions/contributions_data.ts`: 
  - Fetches GitHub data using Puppeteer
  - Implements caching logic
  - Handles retry with exponential backoff

- `apps/web/src/app/(components)/contributions/contributions_svg.ts`:
  - Generates SVG from contribution data
  - Implements 7x53 grid layout (days x weeks)
  - Adds "Get yours from git.show" watermark

- `libs/gitshow-lib/src/utils/themes.ts`:
  - Defines all 7 theme color schemes
  - Each theme has 5 contribution levels (0-4)

- `apps/updater/src/index.ts`:
  - Scheduled job implementation using node-schedule
  - Handles Twitter API v1.1 banner uploads
  - Processes job queue with concurrent limit of 5

- `apps/web/src/lib/auth.ts`:
  - NextAuth configuration with custom JWT/session callbacks
  - Handles dual authentication logic
  - Encrypts tokens before storage

### Common Development Tasks

1. **Adding a new theme**:
   - Add theme definition to `libs/gitshow-lib/src/utils/themes.ts`
   - Update theme type in database schema if needed
   - No UI changes needed - themes are dynamically loaded

2. **Debugging authentication issues**:
   - Check email matching between GitHub and Twitter accounts
   - Verify environment variables are set correctly
   - Look for `fullyAuthenticated` flag in session

3. **Testing contribution fetching**:
   - Can test locally by calling `getContributions()` directly
   - Browserless URL and token required for Puppeteer
   - Check `lastFetchTimestamp` to understand caching

4. **Database migrations**:
   - Create new migration in `libs/db/migrations/`
   - Run `pnpm --filter @gitshow/db migrate`
   - Update Kysely types accordingly