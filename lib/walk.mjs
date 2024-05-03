import fs from "node:fs/promises";
import path from "node:path";

/**
 * Walk over the directory and
 * @param {string} dir
 * @param {{ext?: string[]}} filters
 * @returns {AsyncGenerator<string>}
 */
export async function* walkDir(dir, filters = {}) {
  const files = await fs.readdir(dir);

  for (const file of files) {
    const dirPath = path.join(dir, file);
    const isDirectory = await fs.stat(dirPath).then((stat) => stat.isDirectory());

    if (isDirectory) {
      yield* await walkDir(dirPath, filters);
    } else {
      if (filters.ext && !filters.ext.includes(path.extname(file))) continue;

      yield path.join(dir, file);
    }
  }
}
