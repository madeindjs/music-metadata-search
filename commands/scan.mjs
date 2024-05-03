import { eq } from "drizzle-orm";
import { db } from "../lib/drizzle/database.mjs";
import { ScansTracks, Tracks } from "../lib/drizzle/schema.mjs";
import { logger } from "../lib/logger.mjs";
import { scanAudioFiles } from "../lib/scan.mjs";

/**
 * @typedef Options
 * @property {string} logLevel
 * @property {number} cacheTtl
 *
 * @param {string} path
 * @param {Options} opts
 */
export async function scanAction(path, opts) {
  logger.level = opts.logLevel;
  const scanId = await scanAudioFiles(path, { cacheTtl: opts.cacheTtl });
  const files = await findScannedTrackPathForScanId(scanId);

  for await (const file of files) process.stdout.write(`${file}\n`);
}

async function findScannedTrackPathForScanId(scanId) {
  const rows = await db
    .select({ path: Tracks.path })
    .from(ScansTracks)
    .innerJoin(Tracks, eq(Tracks.id, ScansTracks.trackId))
    .where(eq(ScansTracks.scanId, scanId));

  return rows.map((r) => r.path);
}
