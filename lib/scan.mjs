import { and, desc, eq, gte } from "drizzle-orm";
import { parseFile } from "music-metadata";
import { stat } from "node:fs/promises";
import { db } from "./drizzle/database.mjs";
import { Scans, ScansTracks, Tracks } from "./drizzle/schema.mjs";
import { logger } from "./logger.mjs";
import { walkDir } from "./walk.mjs";

/**
 * @typedef Options
 * @property {number} [cacheScanTtl]
 * @property {string[]} ext Extensions of Audio files to load
 *
 * @param {string} path
 * @param {Options} opts
 * @returns {Promise<number>} a Scan ID
 */
export async function scanAudioFiles(path, opts) {
  const existingScanId = await findExistingScanId(
    path,
    opts.ext,
    opts.cacheScanTtl,
  );
  if (existingScanId) {
    logger.info(`use existing scan cache`);
    return existingScanId;
  }

  const scanId = await createScan(path, opts.ext);
  logger.info(`Creating scan cache ${scanId}`);

  /** @type {Promise[]} */
  const promises = [];

  for await (const file of walkDir(path, { ext: opts.ext }))
    promises.push(insertTags(file, scanId));

  await Promise.all(promises);

  return scanId;
}

/**
 * @param {string} file
 * @param {number} scanId
 */
async function insertTags(file, scanId) {
  const fileStats = await stat(file);
  const mtime = Math.round(fileStats.mtimeMs / 1000);

  const existingTrackId = await findTrackIdByPath(file, mtime);
  if (existingTrackId) {
    logger.debug(`[insertTags] Reusing cache for ${file}`);
    await db.insert(ScansTracks).values({ scanId, trackId: existingTrackId });
    return;
  }

  logger.debug(`[insertTags] parsing  ${file}`);
  /** @type {import("music-metadata").IAudioMetadata} */
  let tags;
  try {
    tags = await parseFile(file);
  } catch (err) {
    logger.error(err, "[insertTags] could not parse metadata");
    return;
  }

  const data = {
    genre: tags.common.genre?.join(",") ?? "",
    path: file,
    album: tags.common.album,
    artist: tags.common.artist,
    title: tags.common.title,
    year: tags.common.year || undefined,
    bpm: tags.common.bpm || undefined,
    duration: tags.format.duration,
    bitrate: tags.format.bitrate,
    sampleRate: tags.format.sampleRate,
    musicbrainzArtistId: tags.common.musicbrainz_artistid?.join(","),
    musicbrainzTrackId: tags.common.musicbrainz_trackid,
    musicbrainzRecordingId: tags.common.musicbrainz_recordingid,
    musicbrainzAlbumId: tags.common.musicbrainz_albumid,
    comment: tags.common.comment?.at(0)?.text,
    mtime,
  };

  const rows = await db.insert(Tracks).values(data).returning();

  const track = rows[0];

  await db.insert(ScansTracks).values({ scanId, trackId: track.id });
}

/**
 * @param {string} path
 * @param {number} mtime
 */
async function findTrackIdByPath(path, mtime = 0) {
  const result = await db
    .select({ id: Tracks.id })
    .from(Tracks)
    .where(and(eq(Tracks.path, path), gte(Tracks.mtime, mtime)))
    .orderBy(desc(Tracks.mtime))
    .limit(1);

  return result[0]?.id;
}

/**
 * @param {string} path
 * @param {string[]} ext
 */
async function findExistingScanId(path, ext, cacheScanTtl = 0) {
  const createdAt = Math.round(new Date().getTime() / 1000) - cacheScanTtl - 1;
  const rows = await db
    .select({ id: Scans.id })
    .from(Scans)
    .where(
      and(
        eq(Scans.path, path),
        eq(Scans.ext, [...ext].sort().join()),
        gte(Scans.createdAt, createdAt),
      ),
    )
    .limit(1);

  return rows[0]?.id;
}

/**
 * @param {string} path
 * @param {string[]} ext
 */
async function createScan(path, ext) {
  const rows = await db
    .insert(Scans)
    .values({ path, ext: [...ext].sort().join() })
    .returning({ id: Scans.id });

  const scanId = rows[0].id;
  if (scanId === undefined) throw Error("Could not create the scan");

  return scanId;
}
