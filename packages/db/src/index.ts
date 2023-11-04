import { Kysely } from "kysely";
import { DataApiDialect } from "kysely-data-api";
import { RDSData } from "@aws-sdk/client-rds-data";
import { RDS } from "sst/node/rds";
import { Database } from "./types";

export const db = new Kysely<Database>({
  dialect: new DataApiDialect({
    mode: "postgres",
    driver: {
      database: RDS.dbcluster.defaultDatabaseName,
      secretArn: RDS.dbcluster.secretArn,
      resourceArn: RDS.dbcluster.clusterArn,
      client: new RDSData({}),
    },
  }),
});
