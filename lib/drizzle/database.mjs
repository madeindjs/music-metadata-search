// @ts-check
import { migrate } from "drizzle-orm/libsql/migrator";
import { createClient } from "@libsql/client/sqlite3";
import { URL } from "node:url";
import { drizzle } from "drizzle-orm/libsql";

const client = createClient({ url: "file:db.sqlite" });

export const db = drizzle(client, { logger: false });

await migrate(db, {
  migrationsFolder: new URL("../../drizzle", import.meta.url).pathname,
});
