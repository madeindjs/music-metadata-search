#!/usr/bin/env node
import { createOption, program } from "commander";
import { readFile } from "node:fs/promises";
import process, { cwd } from "node:process";
import { logger } from "./lib/logger.mjs";
import { search } from "./lib/search.mjs";

const packageJson = JSON.parse(
  await readFile(new URL("./package.json", import.meta.url), {
    encoding: "utf-8",
  }),
);

program
  .name(packageJson.name)
  .description(packageJson.description)
  .version(packageJson.version);

const logLevelOption = createOption("--log-level [logLevel]", "Log level")
  .choices(Object.values(logger.levels.labels))
  .default("fatal");

const extensionsListOption = createOption(
  "--ext [ext...]",
  "Extensions of Audio files to scan",
);
extensionsListOption.defaultValue = [".mp3", ".flac", ".m4a", ".ogg", ".aac"];

const formatOption = createOption("-f, --format [format]", "Output format")
  .choices(["txt", "json", "m3u"])
  .default("txt");

const rangeDescription =
  "If a single value is provided, it will filter by `=`, you can also give a range like `1..10 to filter using `BETWEEN` operator";

program
  .option("-q, --query [genre]", `Search the term everywhere)`)
  .option(
    "-g, --genre [genre]",
    ["Filter by genre of the track using `LIKE` operator"].join("\n"),
  )
  .option(
    "-a, --artist [artist]",
    ["Filter by artist of the track using `LIKE` operator"].join("\n"),
  )
  .option(
    "-b, --album [album]",
    ["Filter by album of the track using `LIKE` operator"].join("\n"),
  )
  .option(
    "-y, --year [year]",
    ["Filter by year of the track", rangeDescription].join("\n"),
  )
  .option(
    "-t, --title [title]",
    ["Title of the track to search using `LIKE` operator"].join("\n"),
  )
  .option(
    "-c, --comment [comment]",
    ["Comment of the track to search using `LIKE` operator"].join("\n"),
  )
  .option(
    "-d,--duration [duration]",
    ["Filter by duration of the track (in seconds)", rangeDescription].join(
      "\n",
    ),
  )
  .option(
    "--bpm [bpm]",
    ["Filter by BPM of the track", rangeDescription].join("\n"),
  )
  .option(
    "--bitrate [bitrate]",
    ["Filter by bitrate of the track (in bits/seconds)", rangeDescription].join(
      "\n",
    ),
  )
  .option("--musicbrainzTrackId [musicbrainzTrackId]")
  .option("--musicbrainzArtistId [musicbrainzArtistId]")
  .option("--musicbrainzAlbumId [musicbrainzAlbumId]")
  .option("--musicbrainzRecordingId [musicbrainzRecordingId]")
  .option("-l, --limit [limit]", "Limit the number of tracks returned")
  .addOption(formatOption)
  .addOption(extensionsListOption)
  .addOption(logLevelOption)
  .argument("[path]", "The directory of local files", cwd())
  .action(async (path, opts) => {
    const tracks = search(path, {
      ...opts,
      year: expandRange(opts.year),
      bpm: expandRange(opts.bpm),
      bitrate: expandRange(opts.bitrate),
      sampleRate: expandRange(opts.sampleRate),
      duration: expandRange(opts.duration),
    });
    switch (opts.format) {
      case "json": {
        let isFirst = true;
        process.stdout.write("[\n");
        for await (const track of tracks) {
          if (!isFirst) process.stdout.write(",\n");
          process.stdout.write(JSON.stringify(track));
          process.stdout.write("\n");
          isFirst = false;
        }
        break;
      }

      case "txt":
        for await (const track of tracks) {
          process.stdout.write(`${track.path}\n`);
        }
        break;

      case "m3u": {
        const title = "Foo";
        process.stdout.write("#EXTM3U\n");
        process.stdout.write(`#PLAYLIST:${title}\n`);
        process.stdout.write(`\n`);

        for await (const track of tracks) {
          process.stdout.write(`#EXTINF:0,${track.artist} - ${track.title}\n`);
          process.stdout.write(`${track.path}\n`);
          process.stdout.write(`\n`);
        }
        break;
      }
    }
  });

program.showHelpAfterError(true);

program.parse();

/**
 * @param {string | number | undefined} value
 * @returns {number | import('./type.ts').Range | undefined}
 */
function expandRange(value) {
  if (value === undefined) return undefined;
  if (typeof value === "number") return value;

  if (value.startsWith("<")) return [-Infinity, Number(value.slice(1))];
  if (value.startsWith(">")) return [Number(value.slice(1)), Infinity];

  const split = value.split("..");

  if (split.length === 0) return 0;
  if (split.length === 1) return Number(split[0]);

  // @ts-ignore
  return [Number(split[0]), Number(split[1])];
}
