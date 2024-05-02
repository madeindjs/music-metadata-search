import { parseBuffer } from "music-metadata";
import { readFile } from "node:fs/promises";
import {
  createScan,
  createScannedTrack,
  findExistingScanId,
  findTrackIdByPath,
  insertTrack,
} from "./drizzle/queries.mjs";
import { walkAudioFiles } from "./walk.mjs";

/**
 * @param {string} path
 * @returns {Promise<number>} a Scan ID
 */
export async function scanAudioFiles(path) {
  const existingScanId = await findExistingScanId(path);
  if (existingScanId) return existingScanId;

  const scanId = await createScan(path);
  for await (const file of walkAudioFiles(path)) await insertTags(file, scanId);
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

  const buffer = await readFile(file);
  const tags = await parseBuffer(buffer);

  const track = await insertTrack(file, tags);
  await createScannedTrack(scanId, track.id);
}
