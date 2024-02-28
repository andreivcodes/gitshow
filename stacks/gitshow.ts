import { Cron, NextjsSite, Queue, RDS, StackContext } from "sst/constructs";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { config as dotenv_config } from "dotenv";

export function stack({ stack }: StackContext) {
  dotenv_config();

  stack.setDefaultFunctionProps({
    logRetention: "one_day",
    tracing: "disabled",
    memorySize: "1 GB",
    architecture: "arm_64",
    runtime: "nodejs18.x",
  });

  const db = new RDS(stack, "Database", {
    engine: "postgresql13.9",
    defaultDatabaseName: "gitshow_db",
    migrations: "libs/db/migrations",
  });

  const queue = new Queue(stack, "UpdateQueue", {
    consumer: {
      function: {
        handler: "packages/functions/src/update_user.handler",
        environment: {
          TOKENS_ENCRYPT: process.env.TOKENS_ENCRYPT ?? "",
          GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ?? "",
          TWITTER_CONSUMER_KEY: process.env.TWITTER_CONSUMER_KEY ?? "",
          TWITTER_CONSUMER_SECRET: process.env.TWITTER_CONSUMER_SECRET ?? "",
        },
        bind: [db]
      },
    },
  });

  new Cron(stack, "cron_update", {
    schedule: "rate(6 hours)",
    job: {
      function: {
        handler: "packages/functions/src/cron_update.handler",
        bind: [queue, db],
      },
    },
  });

  const web = new NextjsSite(stack, "web", {
    path: "packages/web",
    memorySize: "2 GB",
    warm: 40,
    imageOptimization: {
      memorySize: "2 GB",
    },
    customDomain: {
      domainName:
        "git.show",
      isExternalDomain: true,
      cdk: {
        certificate: Certificate.fromCertificateArn(stack, "1cfbc0f1-620b-428c-a4fe-08da7ecfb611", "arn:aws:acm:us-east-1:339712892826:certificate/1cfbc0f1-620b-428c-a4fe-08da7ecfb611"),
      },
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
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? "",
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? "",
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? "",
      TOKENS_ENCRYPT: process.env.TOKENS_ENCRYPT ?? "",
      TWITTER_CONSUMER_KEY: process.env.TWITTER_CONSUMER_KEY ?? "",
      TWITTER_CONSUMER_SECRET: process.env.TWITTER_CONSUMER_SECRET ?? "",
      GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ?? "",
      GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET ?? "",
    },
    bind: [queue, db],
  });

  stack.addOutputs({
    url: web.url,
    customDomainUrl: web.customDomainUrl
  });
}
