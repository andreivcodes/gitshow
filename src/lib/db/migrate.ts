import * as path from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";
import { Migrator, FileMigrationProvider } from "kysely";
import { db } from "./index";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function migrateToLatest() {
  console.log("Running database migrations...");

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.resolve(__dirname, "./migrations"),
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(`Migration "${it.migrationName}" executed successfully`);
    } else if (it.status === "Error") {
      console.error(`Migration "${it.migrationName}" failed`);
    }
  });

  if (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }

  if (!results?.length) {
    console.log("No pending migrations");
  }

  await db.destroy();
  console.log("Migrations complete");
}

// Run migrations directly when this file is executed
migrateToLatest();
