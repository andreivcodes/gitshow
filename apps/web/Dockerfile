# Use the latest Node.js version for the build stage
FROM node:latest as builder

# Set the working directory
WORKDIR /app

# Copy package-related files
COPY package.json yarn.lock .yarnrc.yml ./

# Copy project-specific package files
COPY apps/web/package.json apps/web/
COPY libs/gitshow-lib/package.json libs/gitshow-lib/
COPY prisma/ prisma/

# Install dependencies
RUN npm install -g corepack@latest && corepack enable

RUN yarn install --mode=update-lockfile
RUN yarn install

# Define build argument
ARG DATABASE_URL
ARG BROWSERLESS_WSS
ARG BROWSERLESS_TOKEN
ARG GITHUB_CLIENT_ID
ARG GITHUB_CLIENT_SECRET
ARG TWITTER_CONSUMER_KEY
ARG TWITTER_CONSUMER_SECRET
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL

# Set the environment variable for the build phase
ENV DATABASE_URL=${DATABASE_URL}
ENV BROWSERLESS_WSS=${BROWSERLESS_WSS}
ENV BROWSERLESS_TOKEN=${BROWSERLESS_TOKEN}
ENV GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
ENV GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET}
ENV TWITTER_CONSUMER_KEY=${TWITTER_CONSUMER_KEY}
ENV TWITTER_CONSUMER_SECRET=${TWITTER_CONSUMER_SECRET}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}

# Copy the remaining project files
COPY apps/web/ apps/web/
COPY libs/gitshow-lib/ libs/gitshow-lib/

# Build the project
RUN yarn build-web

# Set the default command
CMD ["yarn", "start-web"]
