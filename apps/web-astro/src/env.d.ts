/// <reference types="astro/client" />

declare module "@auth/core" {
  interface Session extends DefaultSession {
    user: {
      automaticallyUpdate: boolean;
      lastUpdateTimestamp: Date | null;
      updateInterval: RefreshInterval;

      theme: AvailableThemeNames;

      lastSubscriptionTimestamp: Date | null;

      fullyAuthenticated: boolean;
      twitterAuthenticated: boolean;
      githubAuthenticated: boolean;

      twittername: string | null;
      twittertag: string | null;
      twitterimage: string | null;

      githubname: string | null;
    } & DefaultSession["user"];
  }
}
