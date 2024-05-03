import { parseStream } from "music-metadata";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import {
  createScan,
  createScannedTrack,
  deleteCacheData,
  findExistingScanId,
  findTrackIdByPath,
  insertTrack,
} from "./drizzle/queries.mjs";
import { logger } from "./logger.mjs";
import { walkAudioFiles } from "./walk.mjs";

/**
 * @typedef Options
 * @property {number} cacheTtl
 *
 * @param {string} path
 * @param {Options} opts
 * @returns {Promise<number>} a Scan ID
 */
export async function scanAudioFiles(path, opts) {
  await deleteCacheData(opts.cacheTtl);
  const existingScanId = await findExistingScanId(path);
  if (existingScanId) {
    logger.info(`use existing scan cache`);
    return existingScanId;
  }

  const scanId = await createScan(path);
  logger.info(`Creating scan cache ${scanId}`);

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
  const fileStats = await stat(file);
  const mtime = Math.round(fileStats.mtimeMs / 1000);

  const existingTrackId = await findTrackIdByPath(file, mtime);
  if (existingTrackId) {
    logger.debug(`[insertTags] Reusing cache for ${file}`);
    await createScannedTrack(scanId, existingTrackId);
    return;
  }

  logger.debug(`[insertTags] parsing  ${file}`);
  const tags = await parseStream(createReadStream(file));
  const track = await insertTrack(file, tags, mtime);
  await createScannedTrack(scanId, track.id);
}
