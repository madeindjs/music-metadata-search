import { parseStream } from "music-metadata";
import { createReadStream } from "node:fs";
import {
  createScan,
  createScannedTrack,
  findExistingScanId,
  findTrackIdByPath,
  insertTrack,
} from "./drizzle/queries.mjs";
import { logger } from "./logger.mjs";
import { walkAudioFiles } from "./walk.mjs";

/**
 * @param {string} path
 * @param {{verbose?: boolean}} opts
 * @returns {Promise<number>} a Scan ID
 */
export async function scanAudioFiles(path, opts) {
  const existingScanId = await findExistingScanId(path);
  if (existingScanId) {
    if (opts?.verbose) logger.info(`use existing scan cache`);
    return existingScanId;
  }

  if (opts?.verbose) logger.info(`Create scan cache`);
  const scanId = await createScan(path);

  /** @type {Promise[]} */
  const promises = [];

  for await (const file of walkAudioFiles(path)) promises.push(insertTags(file, scanId));

  await Promise.all(promises);

  return scanId;
}

/**
 * @param {string} file
 * @param {number} scanId
 */
async function insertTags(file, scanId) {
  const existingTrackId = await findTrackIdByPath(file);
  if (existingTrackId) {
    await createScannedTrack(scanId, existingTrackId);
    return;
  }

  const tags = await parseStream(createReadStream(file));

  const track = await insertTrack(file, tags);
  await createScannedTrack(scanId, track.id);
}
