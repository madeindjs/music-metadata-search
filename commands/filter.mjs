import { and, eq, like, sql } from "drizzle-orm";
import process from "node:process";
import { db } from "../lib/drizzle/database.mjs";
import { ScansTracks, Tracks } from "../lib/drizzle/schema.mjs";
import { scanAudioFiles } from "../lib/scan.mjs";

/**
 * @typedef Options
 * @property {string} [artist]
 * @property {string} [album]
 * @property {string} [title]
 * @property {string} [genre]
 * @property {number} [year]
 * @property {string} [where]
 * @property {boolean} [verbose]
 * @property {number} cacheTtl
 *
 * @param {string} path
 * @param {Options} opts
 */
export async function filterAction(path, opts) {
  const scanId = await scanAudioFiles(path, { verbose: opts.verbose, cacheTtl: opts.cacheTtl });

  /** @type {import("drizzle-orm").SQLWrapper[]} */
  const wheres = [];

  if (opts.artist) wheres.push(like(Tracks.artist, `%${opts.artist}%`));
  if (opts.album) wheres.push(like(Tracks.album, `%${opts.album}%`));
  if (opts.title) wheres.push(like(Tracks.title, `%${opts.title}%`));
  if (opts.year) wheres.push(eq(Tracks.year, opts.year));
  if (opts.genre) wheres.push(like(Tracks.genre, `%${opts.genre}%`));
  if (opts.where) wheres.push(sql.raw(opts.where));

  const results = await db
    .select({ path: Tracks.path })
    .from(Tracks)
    .innerJoin(ScansTracks, eq(ScansTracks.trackId, Tracks.id))
    .where(and(eq(ScansTracks.scanId, scanId), ...wheres));

  for (const res of results) {
    process.stdout.write(`${res.path}\n`);
  }
}
