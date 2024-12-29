import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Drop existing tables if they exist
  await db.schema.dropTable("jobQueue").ifExists().execute();
  await db.schema.dropTable("user").ifExists().execute();

  // Create the 'user' table
  await db.schema
    .createTable("user")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn("email", "varchar", (col) => col.notNull().unique())
    .addColumn("automaticallyUpdate", "boolean", (col) =>
      col.notNull().defaultTo(true)
    )
    .addColumn("lastUpdateTimestamp", "timestamp")
    .addColumn("updateInterval", "varchar", (col) =>
      col.notNull().defaultTo("EVERY_DAY")
    )
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

  // Create the 'jobQueue' table
  await db.schema
    .createTable("jobQueue")
    .addColumn("id", "uuid", (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`)
    )
    .addColumn("userId", "uuid", (col) => col.notNull().references("user.id"))
    .addColumn("status", "varchar", (col) => col.notNull().defaultTo("pending"))
    .addColumn("createdAt", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop the tables if they exist
  await db.schema.dropTable("jobQueue").ifExists().execute();
  await db.schema.dropTable("user").ifExists().execute();
}
