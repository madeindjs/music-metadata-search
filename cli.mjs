#!/usr/bin/env node
import { createArgument, createOption, program } from "commander";
import { readFile } from "node:fs/promises";
import { cwd } from "node:process";
import { scanAction } from "./commands/scan.mjs";
import { filterAction } from "./commands/search.mjs";
import { Tracks } from "./lib/drizzle/schema.mjs";

const packageJson = JSON.parse(await readFile(new URL("./package.json", import.meta.url), { encoding: "utf-8" }));

program.name(packageJson.name).description(packageJson.description).version(packageJson.version);

const pathOption = createArgument("[path]", "The directory of local files");
pathOption.defaultValue = cwd();
pathOption.defaultValueDescription = "The current working directory";

const verboseOption = createOption("-v, --verbose", "display more logs");

const ttlOption = createOption("-c, --cache-ttl", "time to live for the cache (in seconds)");
ttlOption.defaultValue = 3_600;
ttlOption.defaultValueDescription = "1 hour";

program
  .command("scan")
  .description("Scan the audio file and save them in the cache")
  .addOption(verboseOption)
  .addOption(ttlOption)
  .argument("[path]", "The directory of local files", cwd())
  .action(scanAction);

const filterableColumns = [
  Tracks.album.name,
  Tracks.artist.name,
  Tracks.title.name,
  Tracks.genre.name,
  Tracks.year.name,
];

program
  .command("search")
  .description("filters tracks by metadata in the given path")
  .option(
    "-g, --genre [genre]",
    ["Genre of the track", "It's an alias of: --where 'genre LIKE \"%Electro%\"'"].join("\n")
  )
  .option(
    "-a, --artists [artist]",
    ["Artist of the track", "It's an alias of: --where 'artist LIKE \"%Daft%\"'"].join("\n")
  )
  .option("-y, --year [year]", ["Year of the track", "It's an alias of: --where 'year = 2024'"].join("\n"))
  .option(
    "-t, --title [title]",
    ["Title of the track", "It's an alias of: --where 'title LIKE \"%Verdis%\"'"].join("\n")
  )
  .option(
    "-w, --where [where]",
    [
      "SQL WHERE expression",
      `You can filters on columns: ${filterableColumns.join(", ")}`,
      `Example: ${Tracks.genre.name} LIKE "%Rock%"`,
    ].join("\n")
  )
  .option(
    "-s, --sort [order]",
    [
      "SQL ORDER BY expression",
      `You can order on columns: ${filterableColumns.join(", ")}.`,
      `Example: ${Tracks.genre.name} DESC`,
    ].join("\n")
  )
  .addOption(verboseOption)
  .addOption(ttlOption)
  .argument("[path]", "The directory of local files", cwd())
  .action(filterAction);

program.showHelpAfterError(true);

program.parse();
