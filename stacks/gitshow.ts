import {
  StackContext,
  Cron,
  NextjsSite,
  Config,
  Queue,
  Table,
} from "sst/constructs";

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
    secret_TOKENS_ENCRYPT,
    secret_GITHUB_CLIENT_ID,
    secret_TWITTER_CONSUMER_KEY,
    secret_TWITTER_CONSUMER_SECRET,
  ]);

  const web = new NextjsSite(stack, "web", {
    path: "packages/web",
    warm: 2,
    customDomain: {
      domainName:
        stack.stage === "production" ? "git.show" : `${stack.stage}.git.show`,
      domainAlias: stack.stage === "production" ? "www.git.show" : undefined,
      hostedZone: "git.show",
    },
    environment: {
      NEXT_PUBLIC_WEBSITE_URL:
        stack.stage === "production"
          ? "https://git.show"
          : `http://localhost:3000`,
      NEXTAUTH_URL:
        stack.stage === "production"
          ? "https://git.show"
          : `http://localhost:3000`,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
    },
    bind: [
      table,
      queue,
      secret_NEXTAUTH_SECRET,
      secret_STRIPE_SECRET_KEY,
      secret_STRIPE_WEBHOOK_SECRET,
      secret_TOKENS_ENCRYPT,
      secret_STRIPE_SECRET_KEY,
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
    schedule: "rate(1 minute)",
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
