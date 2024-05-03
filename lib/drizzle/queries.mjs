import { and, desc, eq, gte, lt } from "drizzle-orm";
import { db } from "./database.mjs";
import { Scans, ScansTracks, Tracks } from "./schema.mjs";

/**
 * @param {string} path
 */
export async function findTrackByPath(path) {
  const result = await db.select().from(Tracks).where(eq(Tracks.path, path)).limit(1);
  return result[0];
}

/**
 * @param {string} path
 * @param {number} mtime
 */
export async function findTrackIdByPath(path, mtime = 0) {
  const result = await db
    .select({ id: Tracks.id })
    .from(Tracks)
    .where(and(eq(Tracks.path, path), gte(Tracks.mtime, mtime)))
    .orderBy(desc(Tracks.mtime))
    .limit(1);

  return result[0]?.id;
}

/**
 *
 * @param {string} path
 * @param {import("music-metadata").IAudioMetadata} tags
 * @param {number} mtime
 */
export async function insertTrack(path, tags, mtime) {
  const rows = await db
    .insert(Tracks)
    .values({
      genre: tags.common.genre?.join(",") ?? "",
      path,
      album: tags.common.album,
      artist: tags.common.artist,
      title: tags.common.title,
      year: tags.common.year,
      mtime,
    })
    .returning();

  return rows[0];
}

/**
 * @param {string} path
 * @returns
 */
export async function createScan(path) {
  const rows = await db.insert(Scans).values({ path }).returning({ id: Scans.id });

  const scanId = rows[0].id;
  if (scanId === undefined) throw Error("Could not create the scan");

  return scanId;
}

/**
 * @param {string} path
 */
export async function findExistingScanId(path) {
  const rows = await db.select({ id: Scans.id }).from(Scans).where(eq(Scans.path, path)).limit(1);
  return rows[0]?.id;
}

export async function findScannedTrackPathForScanId(scanId) {
  const rows = await db
    .select({ path: Tracks.path })
    .from(ScansTracks)
    .innerJoin(Tracks, eq(Tracks.id, ScansTracks.trackId))
    .where(eq(ScansTracks.scanId, scanId));

  return rows.map((r) => r.path);
}

/**
 * @param {number} scanId
 * @param {number} trackId
 */
export async function createScannedTrack(scanId, trackId) {
  return await db.insert(ScansTracks).values({ scanId, trackId });
}

/**
 * @param {number} ttl Time To Live in seconds
 */
export async function deleteCacheData(ttl) {
  const ts = Math.round(new Date().getTime() / 1000) - ttl;
  await db.delete(Scans).where(lt(Scans.createdAt, ts));
}
