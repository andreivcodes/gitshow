import { Cron, NextjsSite, Queue, StackContext } from "sst/constructs";
import { config as dotenv_config } from "dotenv";

export function stack({ stack }: StackContext) {
  stack.setDefaultFunctionProps({
    logRetention: "one_day",
    tracing: "disabled",
    memorySize: "1 GB",
    architecture: "arm_64",
  });

  dotenv_config();

  const deadletter = new Queue(stack, "DeadLetterQueue", {});

  const queue = new Queue(stack, "UpdateQueue", {
    consumer: {
      function: {
        handler: "packages/functions/src/update_user.handler",
        runtime: "nodejs18.x",
        nodejs: {
          esbuild: {
            external: [
              "libsql",
              "@libsql/client",
              "@libsql/linux-arm64-gnu",
              "@libsql/linux-arm64-musl",
            ],
          },
        },
        environment: {
          TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ?? "",
          TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ?? "",
          TOKENS_ENCRYPT: process.env.TOKENS_ENCRYPT ?? "",
          GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ?? "",
          TWITTER_CONSUMER_KEY: process.env.TWITTER_CONSUMER_KEY ?? "",
          TWITTER_CONSUMER_SECRET: process.env.TWITTER_CONSUMER_SECRET ?? "",
        },
      },
    },
    cdk: {
      queue: {
        deadLetterQueue: {
          maxReceiveCount: 3,
          queue: deadletter.cdk.queue,
        },
      },
    },
  });

  const web = new NextjsSite(stack, "web", {
    path: "packages/web",
    memorySize: "2 GB",
    imageOptimization: {
      memorySize: "2 GB",
    },
    customDomain: {
      domainName:
        stack.stage === "production" ? "git.show" : `${stack.stage}.git.show`,
      domainAlias: stack.stage === "production" ? "www.git.show" : undefined,
      hostedZone: "git.show",
    },
    environment: {
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
      NEXT_PUBLIC_WEBSITE_URL:
        stack.stage === "production"
          ? "https://git.show"
          : `https://${stack.stage}.git.show`,
      NEXTAUTH_URL:
        stack.stage === "production"
          ? "https://git.show"
          : `https://${stack.stage}.git.show`,
      TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ?? "",
      TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ?? "",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? "",
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? "",
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? "",
      TOKENS_ENCRYPT: process.env.TOKENS_ENCRYPT ?? "",
      TWITTER_CONSUMER_KEY: process.env.TWITTER_CONSUMER_KEY ?? "",
      TWITTER_CONSUMER_SECRET: process.env.TWITTER_CONSUMER_SECRET ?? "",
      GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ?? "",
      GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET ?? "",
    },
  });

  new Cron(stack, "cron_update", {
    schedule: "rate(1 hour)",
    job: {
      function: {
        runtime: "nodejs18.x",
        handler: "packages/functions/src/cron_update.handler",
        bind: [queue],
      },
    },
  });

  stack.addOutputs({
    SiteUrl: web.customDomainUrl || web.url,
  });
}
