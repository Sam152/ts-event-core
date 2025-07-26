import writeTextFile = Deno.writeTextFile;
import { join } from "jsr:@std/path";

function readmeContents(): string {
  return `
  # ts-event-core
  
  This foo

  Status: In Development / Unmaintained
`.trim() + `\n`;
}

async function generateReadme() {
  const contents = readmeContents();
  await writeTextFile(join(import.meta.dirname!, "../README.md"), contents);

  return "Generating README.md complete";
}

generateReadme().then(console.log);
