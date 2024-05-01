import { count, eq } from "drizzle-orm";
import { parseBuffer } from "music-metadata";
import { readFile } from "node:fs/promises";
import { db } from "../lib/drizzle/database.mjs";
import { Tracks } from "../lib/drizzle/schema.mjs";
import { walkAudioFiles } from "../lib/walk.mjs";

/**
 * @typedef Options
 * @property {string} [genre]
 *
 * @param {string} path
 */
export async function scanAction(path) {
  for await (const file of walkAudioFiles(path)) {
    await insertTags(file);
  }
}

/**
 * @param {string} file
 */
async function insertTags(file) {
  const result = await db.select({ count: count() }).from(Tracks).where(eq(Tracks.path, file)).limit(1);

  const rowsCount = result[0]?.count ?? 0;

  if (rowsCount) return;

  const buffer = await readFile(file);
  const tags = await parseBuffer(buffer);

  await db.insert(Tracks).values({ tags: JSON.stringify(tags), genre: tags.common.genre?.join(",") ?? "", path: file });
}
