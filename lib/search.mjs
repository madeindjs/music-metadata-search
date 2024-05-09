import { and, between, eq, like, or, sql } from "drizzle-orm";
import { DEFAULT_AUDIO_EXT } from "./constants.mjs";
import { db } from "./drizzle/database.mjs";
import { ScansTracks, Tracks } from "./drizzle/schema.mjs";
import { logger } from "./logger.mjs";
import { scanAudioFiles } from "./scan.mjs";

/**
 *
 * @typedef {[from: number, to: number]} Range
 *
 * @typedef Options
 * @property {string} [album] Filter album of the track using `LIKE` operator
 * @property {string} [artist] Filter artist of the track using `LIKE` operator
 * @property {string} [genre] Filter genre of the track using `LIKE` operator
 * @property {string} [title] Filter by title of the track to search using `LIKE` operator
 * @property {number | Range} [bpm] Filter by BPM of the track using `=` operator or `BETWEEN` if a range is given
 * @property {number | Range} [year] Filter by year of the track using `=` operator or `BETWEEN` if a range is given
 * @property {number | Range} [bitrate] Filter by bitrate (in bits/seconds) of the track using `=` operator or `BETWEEN` if a range is given
 * @property {number} [bpm] Filter by BPM of the track using `=` operator or `BETWEEN` if a range is given
 * @property {number | Range} [duration] Filter by duration of the track (in seconds), using `=` operator or `BETWEEN` if a range is given
 *
 * @property {string} [query] Search the term everywhere
 * @property {string} [sort] SQL ORDER BY expression
 * @property {string} [where] SQL WHERE expression
 *
 * @property {number} [cacheScanTtl]
 * @property {string[]} [ext] Extensions of Audio files to scan
 * @property {number} [limit] Limit the number of tracks returned
 * @property {string} [logLevel] Log level for [pino](https://www.npmjs.com/package/pino) (default to `'silent'`)
 *
 * @param {string} path
 * @param {Options} opts
 */
export async function search(path, opts = {}) {
  logger.level = opts.logLevel ?? "silent";
  const scanId = await scanAudioFiles(path, {
    cacheScanTtl: opts.cacheScanTtl ?? 3_600,
    ext: opts.ext ?? [...DEFAULT_AUDIO_EXT],
  });

  /** @type {import("drizzle-orm").SQLWrapper[]} */
  const wheres = [];

  /**
   * @param {number | Range} value
   */
  const addWhereRange = (col, value) => {
    if (Array.isArray(value)) {
      wheres.push(between(col, value[0], value[1]));
    } else {
      wheres.push(eq(col, opts.year));
    }
  };

  if (opts.artist) wheres.push(like(Tracks.artist, `%${opts.artist}%`));
  if (opts.album) wheres.push(like(Tracks.album, `%${opts.album}%`));
  if (opts.title) wheres.push(like(Tracks.title, `%${opts.title}%`));
  if (opts.genre) wheres.push(like(Tracks.genre, `%${opts.genre}%`));
  if (opts.where) wheres.push(sql.raw(opts.where));
  if (opts.year) addWhereRange(Tracks.year, opts.year);
  if (opts.duration) addWhereRange(Tracks.year, opts.duration);
  if (opts.bpm) addWhereRange(Tracks.year, opts.bpm);
  if (opts.bitrate) addWhereRange(Tracks.year, opts.bitrate);
  if (opts.query) {
    const cond = or(
      like(Tracks.album, `%${opts.query}%`),
      like(Tracks.artist, `%${opts.query}%`),
      like(Tracks.title, `%${opts.query}%`),
      like(Tracks.genre, `%${opts.query}%`)
    );
    if (cond) wheres.push(cond);
  }

  const query = db
    .select({
      path: Tracks.path,
      title: Tracks.title,
      genre: Tracks.genre,
      artist: Tracks.artist,
      album: Tracks.album,
      year: Tracks.year,
      bitrate: Tracks.bitrate,
      bpm: Tracks.bpm,
      duration: Tracks.duration,
    })
    .from(Tracks)
    .innerJoin(ScansTracks, eq(ScansTracks.trackId, Tracks.id))
    .where(and(eq(ScansTracks.scanId, scanId), ...wheres))
    .orderBy(opts.sort ? sql.raw(opts.sort) : Tracks.id);

  if (opts.limit) query.limit(Number(opts.limit));

  logger.debug(`${query.toSQL().sql} -- ${JSON.stringify(query.toSQL().params)}`);

  return await query;
}
