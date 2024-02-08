import "dotenv/config";
import type { Config } from "drizzle-kit";
import { config } from "dotenv";

config();

export default {
  schema: "./schema.ts",
  out: "./drizzle",
  driver: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
} satisfies Config;
