import writeTextFile = Deno.writeTextFile;

function readmeContents(): string {
  return `
  # ts-event-core

  Status: In Development / Unmaintained
`.trim();
}

async function generateReadme() {
  const contents = readmeContents();
  await writeTextFile("../README.md", contents);

  return "Generating README.md complete";
}

generateReadme().then(console.log);
