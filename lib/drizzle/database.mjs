import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { URL } from "node:url";

const sqlite = new Database("db.sqlite");

export const db = drizzle(sqlite, { logger: false });

await migrate(db, { migrationsFolder: new URL("../../drizzle", import.meta.url).pathname });
