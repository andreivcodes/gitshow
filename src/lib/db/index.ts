import "server-only";

import {
  DeduplicateJoinsPlugin,
  ExpressionBuilder,
  Kysely,
  ParseJSONResultsPlugin,
  PostgresDialect,
  sql,
  StringReference,
} from "kysely";
import { CamelCasePlugin } from "kysely";
import { DB } from "./types";
import pg from "pg";

const { Pool } = pg;

const db_pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  min: 5,
  max: 10,
});

// Idle clients can error out from under us (e.g. 57P01 when Postgres restarts).
// Without a listener the pool re-emits that as an uncaughtException and the
// process dies; the pool already discards the broken client, so just log it.
db_pool.on("error", (error: Error & { code?: string }) => {
  console.error(
    `[DB] Idle pool client error${error.code ? ` (${error.code})` : ""}:`,
    error.message
  );
});

const createDbInstance = () => {
  return new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: db_pool,
    }),
    plugins: [new CamelCasePlugin(), new DeduplicateJoinsPlugin(), new ParseJSONResultsPlugin()],
  });
};

declare global {
  var db: Kysely<DB> | undefined;
}

export const db = global.db || createDbInstance();

function traverseJSON<DB, TB extends keyof DB>(
  eb: ExpressionBuilder<DB, TB>,
  column: StringReference<DB, TB>,
  path: string | [string, ...string[]]
) {
  if (!Array.isArray(path)) {
    path = [path];
  }

  return sql`${sql.ref(column)}->${sql.raw(path.map((item) => `'${item}'`).join("->"))}`;
}

export { traverseJSON };
export { db_pool };
export * from "./types";
export { Kysely };
export { sql, type Selectable, type Insertable } from "kysely";
export { jsonArrayFrom } from "kysely/helpers/postgres";
export { encryptToken, decryptToken } from "./crypto";

// Re-export RefreshInterval from schemas for backwards compatibility
// The canonical source is now the Zod schema in @/lib/schemas
export { RefreshInterval, type RefreshInterval as RefreshIntervalType } from "@/lib/schemas";
