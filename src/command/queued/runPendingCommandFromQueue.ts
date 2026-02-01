import type postgres from "postgres";
import type { JSONValue } from "npm:postgres@3.4.7";

type QueuedCommand = {
  id: string;
  aggregateRootType: string;
  aggregateRootId: string;
  commandName: string;
  commandData: JSONValue;
  raisedEvents: string[];
  status: "pending" | "complete";
  issuedAt: Date;
};

export async function runPendingCommandFromQueue({ sql }: {
  sql: ReturnType<typeof postgres>;
}) {
  // Select the oldest non-locked command from the queue to work.
  const command = (await sql<QueuedCommand[]>`SELECT *
              FROM event_core.command_queue
              where status = 'pending'
              ORDER BY id ASC LIMIT 1 
              FOR UPDATE SKIP LOCKED`)[0];
  if (!command) {
    return;
  }
}
