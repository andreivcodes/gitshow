import { Kysely } from "kysely";

/**
 * @param db {Kysely<any>}
 */

export async function up(db) {
  await db.schema
    .createTable("users")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("email", "varchar", (col) => col.notNull().unique())
    .addColumn("name", "varchar", (col) => col.notNull())

    .addColumn("stripeCustomerId", "varchar")

    .addColumn("githubId", "varchar")
    .addColumn("githubUsername", "varchar")
    .addColumn("githubToken", "varchar")

    .addColumn("twitterId", "varchar")
    .addColumn("twitterUsername", "varchar")
    .addColumn("twitterOAuthToken", "varchar")
    .addColumn("twitterOAuthTokenSecret", "varchar")

    .addColumn("isFree", "boolean", (col) => col.defaultTo(true))
    .addColumn("isStandard", "boolean", (col) => col.defaultTo(false))
    .addColumn("isPremium", "boolean", (col) => col.defaultTo(false))

    .addColumn("lastSubscriptionTimestamp", "timestamp")
    .execute();
}

/**
 * @param db {Kysely<any>}
 */

export async function down(db) {
  await db.schema.dropTable("users").execute();
}
