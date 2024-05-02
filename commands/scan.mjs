import { findScannedTrackPathForScanId } from "../lib/drizzle/queries.mjs";
import { scanAudioFiles } from "../lib/scan.mjs";

/**
 * @typedef Options
 * @property {boolean} [verbose]
 * @property {number} cacheTtl
 *
 * @param {string} path
 * @param {Options} opts
 */
export async function scanAction(path, opts) {
  const scanId = await scanAudioFiles(path, { verbose: opts.verbose, cacheTtl: opts.cacheTtl });
  const files = await findScannedTrackPathForScanId(scanId);

  for await (const file of files) process.stdout.write(`${file}\n`);
}
