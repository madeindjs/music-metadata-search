#!/usr/bin/env node
import { createOption, program } from "commander";
import { readFile } from "node:fs/promises";
import process, { cwd } from "node:process";
import { Tracks } from "./lib/drizzle/schema.mjs";
import { logger } from "./lib/logger.mjs";
import { search } from "./lib/search.mjs";

const packageJson = JSON.parse(await readFile(new URL("./package.json", import.meta.url), { encoding: "utf-8" }));

program.name(packageJson.name).description(packageJson.description).version(packageJson.version);

const logLevelOption = createOption("-l, --log-level [logLevel]", "Log level")
  .choices(Object.values(logger.levels.labels))
  .default("fatal");

const ttlOption = createOption("--cache-scan-ttl [cacheScanTtl]", "time to live for the cache (in seconds)");
ttlOption.defaultValue = 3_600;
ttlOption.defaultValueDescription = "1 hour";

const extensionsListOption = createOption("--ext [ext...]", "Extensions of Audio files to scan");
extensionsListOption.defaultValue = [".mp3", ".flac", ".m4a", ".ogg", ".aac"];

const filterableColumns = [
  Tracks.album.name,
  Tracks.artist.name,
  Tracks.title.name,
  Tracks.genre.name,
  Tracks.year.name,
];

program
  .option(
    "-g, --genre [genre]",
    ["Genre of the track`LIKE` operator", "It's an alias of: `--where 'genre LIKE \"%Electro%\"'`"].join("\n")
  )
  .option(
    "-a, --artist [artist]",
    ["Artist of the track`LIKE` operator", "It's an alias of: `--where 'artist LIKE \"%Daft%\"'`"].join("\n")
  )
  .option(
    "-b, --album [album]",
    ["Album of the track`LIKE` operator", "It's an alias of: `--where 'album LIKE \"%Discovery%\"'`"].join("\n")
  )
  .option(
    "-y, --year [year]",
    ["Year of the track using `=` operator", "It's an alias of: `--where 'year = 2001'`"].join("\n")
  )
  .option(
    "-t, --title [title]",
    [
      "Title of the track to search using `LIKE` operator",
      "It's an alias of: `--where 'title LIKE \"%Verdis%\"'`",
    ].join("\n")
  )
  .option(
    "-w, --where [where]",
    [
      "SQL WHERE expression",
      `You can filters on columns: ${filterableColumns.join(", ")}`,
      `Example: \`${Tracks.genre.name} LIKE "%Rock%"\``,
    ].join("\n")
  )
  .option(
    "-s, --sort [order]",
    [
      "SQL ORDER BY expression",
      `You can order on columns: ${filterableColumns.join(", ")}.`,
      `Example: \`${Tracks.genre.name} DESC\``,
    ].join("\n")
  )
  .addOption(extensionsListOption)
  .addOption(logLevelOption)
  .addOption(ttlOption)
  .argument("[path]", "The directory of local files", cwd())
  .action(async (path, opts) => {
    const results = await search(path, opts);

    for (const res of results) {
      process.stdout.write(`${res.path}\n`);
    }
  });

program.showHelpAfterError(true);

program.parse();
