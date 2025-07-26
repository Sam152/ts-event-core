import { join } from "jsr:@std/path";

export async function startTestContainers() {
  const infraPath = join(import.meta.dirname!, "infra");

  const downCommand = new Deno.Command("docker-compose", {
    args: ["down", "-v"],
    cwd: infraPath,
  });

  const downResult = await downCommand.output();
  if (!downResult.success) {
    throw new Error(`docker-compose down failed: ${new TextDecoder().decode(downResult.stderr)}`);
  }

  const upCommand = new Deno.Command("docker-compose", {
    args: ["up", "-d"],
    cwd: infraPath,
  });

  const upResult = await upCommand.output();
  if (!upResult.success) {
    throw new Error(`docker-compose up failed: ${new TextDecoder().decode(upResult.stderr)}`);
  }
}
