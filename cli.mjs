import { createArgument, program } from "commander";
import { readFile } from "node:fs/promises";
import { cwd } from "node:process";
import { filterAction } from "./commands/filter.mjs";
import { scanAction } from "./commands/scan.mjs";

const packageJson = JSON.parse(await readFile(new URL("./package.json", import.meta.url), { encoding: "utf-8" }));

program.name(packageJson.name).description(packageJson.description).version(packageJson.version);

const pathOption = createArgument("[path]", "The directory of local files");
pathOption.defaultValue = cwd();
pathOption.defaultValueDescription = "The current working directory";

program.option("-v, --verbose", "display more logs");

program
  .command("scan")
  .description("Scan the audio file and save them in the cache")
  .argument("[path]", "The directory of local files", cwd())
  .action(scanAction);

program
  .command("filter")
  .description("filters tracks by metadata in the given path")
  .option("-g, --genre [genre]", "Genre of the track")
  .option("-a, --artists [artist]", "Artist of the track")
  .option("-w, --where [where]", "SQL filter where expression")
  .argument("[path]", "The directory of local files", cwd())
  .action(filterAction);

program.showHelpAfterError(true);

program.parse();
