import writeTextFile = Deno.writeTextFile;
import { join } from "jsr:@std/path";

function readmeContents(): string {
  return `
    # ts-event-core
    
    This foo
    
    What is the experience like writing this??
    
    
    aa
  
    Status: In Development / Unmaintained
  `;
}

async function generateReadme() {
  await writeTextFile(
    join(import.meta.dirname!, "../README.md"),
    [
      (str: string) => str.trim(),
      (str: string) => `${str}\n`,
    ].reduce<string>((str, fn) => fn(str), readmeContents()),
  );
  return "Generating README.md complete";
}

generateReadme().then(console.log);
