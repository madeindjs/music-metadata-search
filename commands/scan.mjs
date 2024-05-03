import { findScannedTrackPathForScanId } from "../lib/drizzle/queries.mjs";
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
