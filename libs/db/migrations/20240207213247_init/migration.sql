-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "stripeCustomerId" TEXT,
    "githubAuthenticated" BOOLEAN NOT NULL DEFAULT false,
    "twitterAuthenticated" BOOLEAN NOT NULL DEFAULT false,
    "githubId" TEXT,
    "githubUsername" TEXT,
    "githubToken" TEXT,
    "twitterId" TEXT,
    "twitterUsername" TEXT,
    "twitterTag" TEXT,
    "twitterPicture" TEXT,
    "twitterOAuthToken" TEXT,
    "twitterOAuthTokenSecret" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'normal',
    "refreshInterval" INTEGER NOT NULL DEFAULT 720,
    "lastRefreshTimestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subscriptionType" TEXT NOT NULL DEFAULT 'free',
    "lastSubscriptionTimestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_stripeCustomerId_idx" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "User_subscriptionType_idx" ON "User"("subscriptionType");

-- CreateIndex
CREATE INDEX "User_lastRefreshTimestamp_idx" ON "User"("lastRefreshTimestamp");
