import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  // Drop existing table if it exists
  await db.schema.dropTable("user").ifExists().execute();

  // Create the 'user' table
  await db.schema
    .createTable("user")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("email", "varchar", (col) => col.notNull().unique())
    .addColumn("automaticallyUpdate", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("lastUpdateTimestamp", "timestamp")
    .addColumn("updateInterval", "varchar", (col) => col.notNull().defaultTo("EVERY_DAY"))
    .addColumn("theme", "varchar", (col) => col.notNull().defaultTo("normal"))
    .addColumn("githubAuthenticated", "boolean")
    .addColumn("twitterAuthenticated", "boolean")
    .addColumn("githubId", "varchar")
    .addColumn("githubUsername", "varchar")
    .addColumn("githubToken", "varchar")
    .addColumn("twitterId", "varchar")
    .addColumn("twitterUsername", "varchar")
    .addColumn("twitterTag", "varchar")
    .addColumn("twitterPicture", "varchar")
    .addColumn("twitterOAuthToken", "varchar")
    .addColumn("twitterOAuthTokenSecret", "varchar")
    .addColumn("contribData", "jsonb")
    .addColumn("lastFetchTimestamp", "timestamp")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("user").ifExists().execute();
}
