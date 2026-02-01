import { createTestConnection } from "./infra/testPostgresConnectionOptions.ts";

export async function prepareTestDatabaseContainer() {
  // Ensure the database can be connected to before resolving.
  const sql = createTestConnection();

  // Reset test tables, that might container any data.
  await sql`TRUNCATE TABLE "event_core"."events" RESTART IDENTITY CASCADE`;
  await sql`TRUNCATE TABLE "event_core"."snapshots" RESTART IDENTITY CASCADE`;
  await sql`TRUNCATE TABLE "event_core"."cursor" RESTART IDENTITY CASCADE`;
  await sql`TRUNCATE TABLE "event_core"."command_queue" RESTART IDENTITY CASCADE`;
  await sql.end();
}
