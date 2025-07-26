import writeTextFile = Deno.writeTextFile;
import { join } from "jsr:@std/path";
import { trimCharsOffFirstLine } from "./utils/trimCharsOffFirstLine.ts";
import { README } from "./README.ts";

async function generateReadme() {
  await writeTextFile(
    join(import.meta.dirname!, "../README.md"),
    [
      trimCharsOffFirstLine(4),
      (str: string) => str.trim(),
      (str: string) => `${str}\n`,
    ].reduce<string>((str, fn) => fn(str), README()),
  );
  return "Generating README.md complete";
}

generateReadme().then(console.log);
