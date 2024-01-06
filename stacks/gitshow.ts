import {
  Config,
  Cron,
  NextjsSite,
  Queue,
  StackContext,
  Table,
} from "sst/constructs";
import { config as dotenv_config } from "dotenv";

export function stack({ stack }: StackContext) {
  stack.setDefaultFunctionProps({ logRetention: "one_day" });

  dotenv_config();

  const param_NEXTAUTH_SECRET = new Config.Parameter(stack, "NEXTAUTH_SECRET", {
    value: process.env.NEXTAUTH_SECRET ?? "",
  });

  const param_STRIPE_SECRET_KEY = new Config.Parameter(
    stack,
    "STRIPE_SECRET_KEY",
    { value: process.env.STRIPE_SECRET_KEY ?? "" }
  );
  const param_STRIPE_WEBHOOK_SECRET = new Config.Parameter(
    stack,
    "STRIPE_WEBHOOK_SECRET",
    {
      value: process.env.STRIPE_WEBHOOK_SECRET ?? "",
    }
  );

  const param_TOKENS_ENCRYPT = new Config.Parameter(stack, "TOKENS_ENCRYPT", {
    value: process.env.TOKENS_ENCRYPT ?? "",
  });

  const param_TWITTER_CONSUMER_KEY = new Config.Parameter(
    stack,
    "TWITTER_CONSUMER_KEY",
    { value: process.env.TWITTER_CONSUMER_KEY ?? "" }
  );
  const param_TWITTER_CONSUMER_SECRET = new Config.Parameter(
    stack,
    "TWITTER_CONSUMER_SECRET",
    { value: process.env.TWITTER_CONSUMER_SECRET ?? "" }
  );
  const param_GITHUB_CLIENT_ID = new Config.Parameter(
    stack,
    "GITHUB_CLIENT_ID",
    { value: process.env.GITHUB_CLIENT_ID ?? "" }
  );
  const param_GITHUB_CLIENT_SECRET = new Config.Parameter(
    stack,
    "GITHUB_CLIENT_SECRET",
    { value: process.env.GITHUB_CLIENT_SECRET ?? "" }
  );

  const table = new Table(stack, "User", {
    fields: {
      email: "string",
      name: "string",
      stripeCustomerId: "string",

      githubAuthenticated: "string",
      twitterAuthenticated: "string",

      githubId: "string",
      githubUsername: "string",
      githubToken: "string",

      twitterId: "string",
      twitterUsername: "string",
      twitterTag: "string",
      twitterPicture: "string",
      twitterOAuthToken: "string",
      twitterOAuthTokenSecret: "string",

      subscriptionType: "string",
      theme: "string",
      lastSubscriptionTimestamp: "string",
    },
    primaryIndex: { partitionKey: "email" },
    globalIndexes: {
      StripeCustomerIndex: {
        partitionKey: "stripeCustomerId",
      },
      SubscriptionTypeIndex: {
        partitionKey: "subscriptionType",
      },
    },
  });

  const deadletter = new Queue(stack, "DeadLetterQueue", {});

  const queue = new Queue(stack, "UpdateQueue", {
    consumer: {
      function: {
        handler: "packages/functions/src/update_user.handler",
        runtime: "nodejs18.x",
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

  queue.bind([
    param_TOKENS_ENCRYPT,
    param_GITHUB_CLIENT_ID,
    param_TWITTER_CONSUMER_KEY,
    param_TWITTER_CONSUMER_SECRET,
  ]);

  const web = new NextjsSite(stack, "web", {
    path: "packages/web",
    warm: 10,
    logging: "combined",
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
    },
    bind: [
      table,
      queue,
      param_NEXTAUTH_SECRET,
      param_STRIPE_SECRET_KEY,
      param_STRIPE_WEBHOOK_SECRET,
      param_TOKENS_ENCRYPT,
      param_TWITTER_CONSUMER_KEY,
      param_TWITTER_CONSUMER_SECRET,
      param_GITHUB_CLIENT_ID,
      param_GITHUB_CLIENT_SECRET,
    ],
  });

  new Cron(stack, "free_update_job", {
    schedule: "rate(30 days)",
    job: {
      function: {
        runtime: "nodejs18.x",
        handler: "packages/functions/src/free_update_job.handler",
        bind: [table, queue],
      },
    },
  });

  new Cron(stack, "standard_update_job", {
    schedule: "rate(7 days)",
    job: {
      function: {
        runtime: "nodejs18.x",
        handler: "packages/functions/src/standard_update_job.handler",
        bind: [table, queue],
      },
    },
  });

  new Cron(stack, "premium_update_job", {
    schedule: "rate(1 day)",
    job: {
      function: {
        runtime: "nodejs18.x",
        handler: "packages/functions/src/premium_update_job.handler",
        bind: [table, queue],
      },
    },
  });

  stack.addOutputs({
    SiteUrl: web.customDomainUrl || web.url,
  });
}
