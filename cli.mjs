#!/usr/bin/env node
import { createOption, program } from "commander";
import { readFile } from "node:fs/promises";
import process, { cwd } from "node:process";
import { FILTERABLE_COLUMNS, QUERYABLE_COLUMNS } from "./lib/constants.mjs";
import { Tracks } from "./lib/drizzle/schema.mjs";
import { logger } from "./lib/logger.mjs";
import { generateM3uPlaylist } from "./lib/m3u.mjs";
import { search } from "./lib/search.mjs";

const packageJson = JSON.parse(await readFile(new URL("./package.json", import.meta.url), { encoding: "utf-8" }));

program.name(packageJson.name).description(packageJson.description).version(packageJson.version);

const logLevelOption = createOption("--log-level [logLevel]", "Log level")
  .choices(Object.values(logger.levels.labels))
  .default("fatal");

const ttlOption = createOption("--cache-scan-ttl [cacheScanTtl]", "time to live for the cache (in seconds)");
ttlOption.defaultValue = 3_600;
ttlOption.defaultValueDescription = "1 hour";

const extensionsListOption = createOption("--ext [ext...]", "Extensions of Audio files to scan");
extensionsListOption.defaultValue = [".mp3", ".flac", ".m4a", ".ogg", ".aac"];

const formatOption = createOption("-f, --format [format]", "Output format")
  .choices(["txt", "json", "m3u"])
  .default("txt");

const rangeDescription =
  "If a single value is provided, it will filter by `=`, you can also give a range like `1..10 to filter using `BETWEEN` operator";

program
  .option("-q, --query [genre]", `Search the term everywhere (in ${QUERYABLE_COLUMNS.join(", ")})`)
  .option(
    "-w, --where [where]",
    [
      "SQL WHERE expression",
      `You can filters on columns: ${FILTERABLE_COLUMNS.join(", ")}`,
      `Example: \`${Tracks.genre.name} LIKE "%Rock%"\` AND duration between 60 AND 120`,
    ].join("\n")
  )
  .option(
    "-g, --genre [genre]",
    [
      "Filter by genre of the track using `LIKE` operator",
      "It's an alias of: `--where 'genre LIKE \"%Electro%\"'`",
    ].join("\n")
  )
  .option(
    "-a, --artist [artist]",
    [
      "Filter by artist of the track using `LIKE` operator",
      "It's an alias of: `--where 'artist LIKE \"%Daft%\"'`",
    ].join("\n")
  )
  .option(
    "-b, --album [album]",
    [
      "Filter by album of the track using `LIKE` operator",
      "It's an alias of: `--where 'album LIKE \"%Discovery%\"'`",
    ].join("\n")
  )
  .option("-y, --year [year]", ["Filter by year of the track", rangeDescription].join("\n"))
  .option(
    "-t, --title [title]",
    [
      "Title of the track to search using `LIKE` operator",
      "It's an alias of: `--where 'title LIKE \"%Verdis%\"'`",
    ].join("\n")
  )
  .option("-d,--duration [duration]", ["Filter by duration of the track (in seconds)", rangeDescription].join("\n"))
  .option("--bpm [bpm]", ["Filter by BPM of the track", rangeDescription].join("\n"))
  .option("--bitrate [bitrate]", ["Filter by bitrate of the track (in bits/seconds)", rangeDescription].join("\n"))
  .option("-l, --limit [limit]", "Limit the number of tracks returned")
  .option(
    "-s, --sort [order]",
    [
      "SQL ORDER BY expression",
      `You can order on columns: ${FILTERABLE_COLUMNS.join(", ")}.`,
      `Example: \`${Tracks.genre.name} DESC\``,
    ].join("\n")
  )
  .addOption(formatOption)
  .addOption(extensionsListOption)
  .addOption(logLevelOption)
  .addOption(ttlOption)
  .argument("[path]", "The directory of local files", cwd())
  .action(async (path, opts) => {
    const results = await search(path, { ...opts, year: expandRange(opts.year) });

    switch (opts.format) {
      case "json":
        process.stdout.write(JSON.stringify(results));
        break;

      case "txt":
        for (const res of results) process.stdout.write(`${res.path}\n`);
        break;

      case "m3u":
        process.stdout.write(generateM3uPlaylist(results));
        break;
    }
  });

program.showHelpAfterError(true);

program.parse();

/**
 * @param {string | number | undefined} value
 * @returns {number | Range | undefined}
 */
function expandRange(value) {
  if (value === undefined) return undefined;
  if (typeof value === "number") return value;

  const split = value.split("..");

  if (split.length === 0) return 0;
  if (split.length === 1) return Number(split[0]);

  // @ts-ignore
  return [Number(split[0]), Number(split[1])];
}
