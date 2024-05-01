import { program } from "commander";
import { readFile } from "node:fs/promises";
import { cwd } from "node:process";
import { runAction } from "./commands/run.mjs";
import { scanAction } from "./commands/scan.mjs";

const packageJson = JSON.parse(await readFile(new URL("./package.json", import.meta.url), { encoding: "utf-8" }));

program.name(packageJson.name).description(packageJson.description).version(packageJson.version);

program
  .command("scan")
  .description("Scan the audio file and save the tags")
  .argument("[path]", "The directory of local files", cwd())
  .action(scanAction);

program
  .command("run")
  .description("add files and fetch torrents")
  .option("-g, --genre [genre]", "Genre of the track")
  .option("-a, --artists [artists]", "Artists of the track")
  .option("-s, --skip-scan [skipScan]", "Skip the local directory scan of tags")
  .argument("[path]", "The directory of local files", cwd())
  .action(runAction);

program.showHelpAfterError(true);

program.parse();
