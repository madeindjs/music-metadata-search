import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const Tracks = sqliteTable("tracks", {
  id: text("id"),
  path: text("path").notNull(),
  genre: text("genre").notNull(),
  tags: text("tags").notNull(),
  createdAt: integer("createdAt")
    .notNull()
    .$defaultFn(() => Math.floor(new Date().getTime() / 1000)),
});
