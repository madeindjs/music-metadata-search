import { scanAudioFiles } from "../lib/scan.mjs";

/**
 * @typedef Options
 * @property {boolean} [verbose]
 *
 * @param {string} path
 * @param {Options} opts
 */
export async function scanAction(path, opts) {
  for await (const file of scanAudioFiles(path)) process.stdout.write(`${file}\n`);
}
