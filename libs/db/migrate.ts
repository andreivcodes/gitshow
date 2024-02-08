import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "./index";

migrate(db, { migrationsFolder: "migrations" })
  .then(() => {
    console.log("Migrations completed!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migrations failed!", err);
    process.exit(1);
  });
