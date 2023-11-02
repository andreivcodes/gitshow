import { drizzle } from "drizzle-orm/aws-data-api/pg";
import { migrate as mig } from "drizzle-orm/aws-data-api/pg/migrator";
import { RDS } from "sst/node/rds";
import { RDSDataClient } from "@aws-sdk/client-rds-data";

export const db = drizzle(new RDSDataClient({}), {
  // @ts-ignore
  database: RDS.rds.defaultDatabaseName,
  // @ts-ignore
  secretArn: RDS.rds.secretArn,
  // @ts-ignore
  resourceArn: RDS.rds.clusterArn,
});

export const migrate = async (path: string) => {
  return mig(db, { migrationsFolder: path });
};
