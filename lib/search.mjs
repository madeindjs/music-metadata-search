import { and, eq, like, sql } from "drizzle-orm";
import { DEFAULT_AUDIO_EXT } from "./constants.mjs";
import { db } from "./drizzle/database.mjs";
import { ScansTracks, Tracks } from "./drizzle/schema.mjs";
import { logger } from "./logger.mjs";
import { scanAudioFiles } from "./scan.mjs";

/**
 * @typedef Options
 * @property {string} [artist] Artist of the track`LIKE` operator
 * @property {string} [album] Album of the track`LIKE` operator
 * @property {string} [title] Title of the track to search using `LIKE` operator
 * @property {string} [genre] Genre of the track`LIKE` operator
 * @property {number} [year] Year of the track using `=` operator
 * @property {string} [where] SQL WHERE expression
 * @property {string} [sort] SQL ORDER BY expression
 * @property {string[]} [ext] Extensions of Audio files to scan
 * @property {string} [logLevel] Log level for [pino](https://www.npmjs.com/package/pino) (default to `'silent'`)
 * @property {number} [cacheScanTtl]
 *
 * @param {string} path
 * @param {Options} opts
 */
export async function search(path, opts = {}) {
  logger.level = opts.logLevel ?? "silent";
  const scanId = await scanAudioFiles(path, { cacheScanTtl: opts.cacheScanTtl, ext: opts.ext ?? DEFAULT_AUDIO_EXT });

  /** @type {import("drizzle-orm").SQLWrapper[]} */
  const wheres = [];

  if (opts.artist) wheres.push(like(Tracks.artist, `%${opts.artist}%`));
  if (opts.album) wheres.push(like(Tracks.album, `%${opts.album}%`));
  if (opts.title) wheres.push(like(Tracks.title, `%${opts.title}%`));
  if (opts.year) wheres.push(eq(Tracks.year, opts.year));
  if (opts.genre) wheres.push(like(Tracks.genre, `%${opts.genre}%`));
  if (opts.where) wheres.push(sql.raw(opts.where));

  return await db
    .select({
      path: Tracks.path,
      title: Tracks.title,
      genre: Tracks.genre,
      artist: Tracks.artist,
      album: Tracks.album,
      year: Tracks.year,
    })
    .from(Tracks)
    .innerJoin(ScansTracks, eq(ScansTracks.trackId, Tracks.id))
    .where(and(eq(ScansTracks.scanId, scanId), ...wheres))
    .orderBy(opts.sort ? sql.raw(opts.sort) : Tracks.id);
}
