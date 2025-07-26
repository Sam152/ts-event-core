import { join } from "jsr:@std/path";
import postgres from "postgres";
import { testPostgresConnectionOptions } from "./infra/testPostgresConnectionOptions.ts";

export async function prepareTestDatabaseContainer() {
  const infraPath = join(import.meta.dirname!, "infra");
  const upCommand = new Deno.Command("docker-compose", {
    args: ["up", "-d"],
    cwd: infraPath,
  });
  const upResult = await upCommand.output();
  if (!upResult.success) {
    throw new Error(`docker-compose up failed: ${new TextDecoder().decode(upResult.stderr)}`);
  }

  // Ensure the database can be connected to before resolving.
  const sql = postgres(testPostgresConnectionOptions);
  let connected = false;
  while (!connected) {
    try {
      await sql`SELECT 1 FROM "event_core"."events"`;
      connected = true;
    } catch (_e) {
      // Do nothing.
    }
  }

  // Reset test tables, that might container any data.
  await sql`TRUNCATE TABLE "event_core"."events" RESTART IDENTITY CASCADE`;
  await sql.end();
}
