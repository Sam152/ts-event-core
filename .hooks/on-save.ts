import { parseArgs } from "@std/cli/parse-args";

/**
 * To use this in IntelliJ, add the following as a watcher: deno task on-save --file=$FileDir$/$FileName$
 */

const flags = parseArgs(Deno.args, {
  string: ["file"],
});

if (!flags.file) {
  throw new Error("File arg missing.");
}

console.log(`Running on ${flags.file}`);

await run(new Deno.Command("deno", { args: ["lint", `--fix`, flags.file] }));
await run(new Deno.Command("deno", { args: ["fmt", flags.file ?? ""] }));
await run(new Deno.Command("deno", { args: ["task", "readme"] }));

async function run(command: Deno.Command) {
  const { stdout } = await command.output();
  console.log(new TextDecoder().decode(stdout));
}
