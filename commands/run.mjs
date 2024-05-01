import { eq } from "drizzle-orm";
import { parseBuffer } from "music-metadata";
import { readFile } from "node:fs/promises";
import process from "node:process";
import { db } from "../lib/drizzle/database.mjs";
import { Tracks } from "../lib/drizzle/schema.mjs";
import { walkAudioFiles } from "../lib/walk.mjs";

/**
 * @typedef Options
 * @property {string} [genre]
 *
 * @param {string} path
 * @param {Options} opts
 */
export async function runAction(path, opts) {
  for await (const file of walkAudioFiles(path)) {
    const tags = await getTags(file);
    if (!isMatchingFilters(tags, opts)) continue;

    process.stdout.write(`${file}\n`);
  }
}

/**
 * @param {string} file
 * @param {Promise<import("music-metadata").IAudioMetadata>} file
 */
async function getTags(file) {
  const existingTracks = await db.select({ tags: Tracks.tags }).from(Tracks).where(eq(Tracks.path, file)).limit(1);

  if (existingTracks.length) {
    return JSON.parse(existingTracks[0].tags);
  }

  const buffer = await readFile(file);
  const tags = await parseBuffer(buffer);

  await db.insert(Tracks).values({ tags: JSON.stringify(tags), genre: tags.common.genre?.join(",") ?? "", path: file });

  return tags;
}

/**
 * @param {import("music-metadata").IAudioMetadata} tags
 * @param {Omit<Options, 'format'>} opts
 */
function isMatchingFilters(tags, opts) {
  if (opts.genre !== undefined) {
    const isMatching = tags.common.genre?.some((g) => g.includes(String(opts.genre)));
    if (!isMatching) return false;
  }

  return true;
}
