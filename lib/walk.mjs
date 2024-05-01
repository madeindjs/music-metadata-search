import fs from "node:fs/promises";
import path from "node:path";

/**
 * Walk over the directory and
 * @param {string} dir
 * @returns {AsyncGenerator<string>}
 */
async function* walkDir(dir) {
  const files = await fs.readdir(dir);

  for (const file of files) {
    const dirPath = path.join(dir, file);
    const isDirectory = await fs.stat(dirPath).then((stat) => stat.isDirectory());

    if (isDirectory) {
      yield* await walkDir(dirPath);
    } else {
      yield path.join(dir, file);
    }
  }
}

/**
 * Walk over the directory and
 * @param {string} dir
 * @returns {AsyncGenerator<string>}
 */
export async function* walkAudioFiles(dir) {
  const AUDIO_EXT = [".mp3", ".flac"];

  for await (const file of walkDir(dir)) {
    const ext = path.extname(file);
    if (!AUDIO_EXT.includes(ext)) continue;

    yield file;
  }
}
