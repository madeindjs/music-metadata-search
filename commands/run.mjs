import { and, inArray, like } from "drizzle-orm";
import process from "node:process";
import { db } from "../lib/drizzle/database.mjs";
import { Tracks } from "../lib/drizzle/schema.mjs";
import { walkAudioFiles } from "../lib/walk.mjs";
import { scanAction } from "./scan.mjs";

/**
 * @typedef Options
 * @property {string} [genre]
 * @property {boolean} [skipScan]
 *
 * @param {string} path
 * @param {Options} opts
 */
export async function runAction(path, opts) {
  if (!opts.skipScan) await scanAction(path);

  // TODO: store walk
  const files = [];
  for await (const file of walkAudioFiles(path)) files.push(file);

  /** @type {import("drizzle-orm").SQLWrapper[]} */
  const wheres = [];

  if (opts.genre) wheres.push(like(Tracks.genre, `%${opts.genre}%`));

  const results = await db
    .select({ path: Tracks.path })
    .from(Tracks)
    .where(and(inArray(Tracks.path, files), ...wheres));

  for (const res of results) {
    process.stdout.write(`${res.path}\n`);
  }
}
