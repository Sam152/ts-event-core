import type postgres from "postgres";
import type { JSONValue } from "npm:postgres@3.4.7";
import type { AggregateRootRepository } from "../../aggregate/AggregateRootRepository.ts";
import type {
  AggregateRootDefinitionMap,
  AggregateRootDefinitionMapTypes,
} from "../../aggregate/AggregateRootDefinition.ts";

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

export async function runPendingCommandFromQueue<
  TAggregateMap extends AggregateRootDefinitionMap<TAggregateMapTypes>,
  TAggregateMapTypes extends AggregateRootDefinitionMapTypes,
>({ sql }: {
  sql: ReturnType<typeof postgres>;
  aggregateRoots: TAggregateMap;
  aggregateRootRepository: AggregateRootRepository<
    TAggregateMap,
    TAggregateMapTypes
  >;
}) {
  const txn = await sql.reserve();
  const command = (await txn<QueuedCommand[]>`SELECT *
              FROM event_core.command_queue
              where status = 'pending'
              ORDER BY id ASC LIMIT 1 
              FOR UPDATE SKIP LOCKED`)[0];
  if (!command) {
    return;
  }

  const foo = 1;
}
