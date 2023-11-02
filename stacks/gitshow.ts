import { StackContext, Api, EventBus, RDS, Cron } from "sst/constructs";

export function stack({ stack }: StackContext) {
  const rds = new RDS(stack, "db", {
    engine: "postgresql11.13",
    defaultDatabaseName: "gitshow",
  });

  new Cron(stack, "free_update_job", {
    schedule: "rate(1 minute)",
    job: {
      function: {
        handler: "packages/functions/src/free_update_job.handler",
        bind: [rds],
      },
    },
  });

  new Cron(stack, "standard_update_job", {
    schedule: "rate(7 day)",
    job: {
      function: {
        handler: "packages/functions/src/free_update_job.handler",
        bind: [rds],
      },
    },
  });

  new Cron(stack, "premium_update_job", {
    schedule: "rate(1 day)",
    job: {
      function: {
        handler: "packages/functions/src/free_update_job.handler",
        bind: [rds],
      },
    },
  });
}
