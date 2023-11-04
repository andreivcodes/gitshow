import { StackContext, RDS, Cron, NextjsSite, Config } from "sst/constructs";

export function stack({ stack }: StackContext) {
  const secret_NEXTAUTH_SECRET = new Config.Secret(stack, "NEXTAUTH_SECRET");

  const secret_STRIPE_SECRET_KEY = new Config.Secret(
    stack,
    "STRIPE_SECRET_KEY"
  );
  const secret_STRIPE_WEBHOOK_SECRET = new Config.Secret(
    stack,
    "STRIPE_WEBHOOK_SECRET"
  );

  const secret_TOKENS_ENCRYPT = new Config.Secret(stack, "TOKENS_ENCRYPT");

  const secret_TWITTER_CONSUMER_KEY = new Config.Secret(
    stack,
    "TWITTER_CONSUMER_KEY"
  );
  const secret_TWITTER_CONSUMER_SECRET = new Config.Secret(
    stack,
    "TWITTER_CONSUMER_SECRET"
  );
  const secret_GITHUB_CLIENT_ID = new Config.Secret(stack, "GITHUB_CLIENT_ID");
  const secret_GITHUB_CLIENT_SECRET = new Config.Secret(
    stack,
    "GITHUB_CLIENT_SECRET"
  );

  const cluster = new RDS(stack, "dbcluster", {
    engine: "postgresql11.13",
    defaultDatabaseName: "gitshow",
    migrations: "packages/db/migrations",
  });

  const web = new NextjsSite(stack, "web", {
    path: "packages/web",
    logging: "per-route",
    customDomain: {
      domainName:
        stack.stage === "prod" ? "git.show" : `${stack.stage}.git.show`,
      domainAlias: stack.stage === "prod" ? "www.git.show" : undefined,
      hostedZone: "git.show",
    },
    environment: {
      NEXT_PUBLIC_WEBSITE_URL:
        stack.stage === "prod"
          ? "https://git.show"
          : `https://${stack.stage}.git.show`,
      NEXTAUTH_URL:
        stack.stage === "prod"
          ? "https://git.show"
          : `https://${stack.stage}.git.show`,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
    },
    bind: [
      cluster,
      secret_NEXTAUTH_SECRET,
      secret_STRIPE_SECRET_KEY,
      secret_STRIPE_WEBHOOK_SECRET,
      secret_TOKENS_ENCRYPT,
      secret_TWITTER_CONSUMER_KEY,
      secret_TWITTER_CONSUMER_SECRET,
      secret_GITHUB_CLIENT_ID,
      secret_GITHUB_CLIENT_SECRET,
    ],
  });

  new Cron(stack, "free_update_job", {
    schedule: "rate(30 days)",
    job: {
      function: {
        timeout: "1 minute",
        runtime: "nodejs18.x",
        handler: "packages/functions/src/free_update_job.handler",
        bind: [
          cluster,
          secret_TOKENS_ENCRYPT,
          secret_TWITTER_CONSUMER_KEY,
          secret_TWITTER_CONSUMER_SECRET,
          secret_GITHUB_CLIENT_ID,
          secret_GITHUB_CLIENT_SECRET,
        ],
      },
    },
  });

  new Cron(stack, "standard_update_job", {
    schedule: "rate(7 days)",
    job: {
      function: {
        timeout: "1 minute",
        runtime: "nodejs18.x",
        handler: "packages/functions/src/standard_update_job.handler",
        bind: [
          cluster,
          secret_TOKENS_ENCRYPT,
          secret_TWITTER_CONSUMER_KEY,
          secret_TWITTER_CONSUMER_SECRET,
          secret_GITHUB_CLIENT_ID,
          secret_GITHUB_CLIENT_SECRET,
        ],
      },
    },
  });

  new Cron(stack, "premium_update_job", {
    schedule: "rate(1 hour)",
    job: {
      function: {
        timeout: "1 minute",
        runtime: "nodejs18.x",
        handler: "packages/functions/src/premium_update_job.handler",
        bind: [
          cluster,
          secret_TOKENS_ENCRYPT,
          secret_TWITTER_CONSUMER_KEY,
          secret_TWITTER_CONSUMER_SECRET,
          secret_GITHUB_CLIENT_ID,
          secret_GITHUB_CLIENT_SECRET,
        ],
      },
    },
  });

  stack.addOutputs({
    SecretArn: cluster.secretArn,
    ClusterIdentifier: cluster.clusterIdentifier,
    SiteUrl: web.customDomainUrl || web.url,
  });
}
