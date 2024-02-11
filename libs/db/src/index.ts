import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { config } from "dotenv";

config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const takeUniqueOrNull = <T extends any[]>(values: T): T[number] => {
  if (values.length !== 1) return null;
  return values[0]!;
};

export const db = drizzle(client);
export * from "./schema";
export { eq, lt, and } from "drizzle-orm";
