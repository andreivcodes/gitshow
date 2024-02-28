import { sql } from 'kysely'

export async function up(db) {
  console.log("Running init migration");

  await db.schema
    .createTable("user")
    .addColumn("id", "text", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("email", "text", (col) => col.notNull())
    .addColumn("name", "text")
    .addColumn("automaticallyUpdate", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("lastUpdateTimestamp", "timestamp", (col) => col.notNull().defaultTo(new Date()))
    .addColumn("updateInterval", "integer", (col) => col.notNull().defaultTo(720))
    .addColumn("theme", "text", (col) => col.notNull().defaultTo("normal"))
    .addColumn("subscriptionPlan", "text", (col) => col.notNull().defaultTo("FREE"))
    .addColumn("lastSubscriptionTimestamp", "timestamp")
    .addColumn("stripeCustomerId", "text")
    .addColumn("githubAuthenticated", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("twitterAuthenticated", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("githubId", "text")
    .addColumn("githubUsername", "text")
    .addColumn("githubToken", "text")
    .addColumn("twitterId", "text")
    .addColumn("twitterUsername", "text")
    .addColumn("twitterTag", "text")
    .addColumn("twitterPicture", "text")
    .addColumn("twitterOAuthToken", "text")
    .addColumn("twitterOAuthTokenSecret", "text")
    .execute();
}

export async function down(db) {
  await db.schema.dropTable("user").execute();
}
