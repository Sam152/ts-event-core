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
  attempts: number;
  status: "pending" | "complete";
  issuedAt: Date;
};

export async function runPendingCommandFromQueue<
  TAggregateMap extends AggregateRootDefinitionMap<TAggregateMapTypes>,
  TAggregateMapTypes extends AggregateRootDefinitionMapTypes,
>({ sql, aggregateRoots, aggregateRootRepository }: {
  sql: ReturnType<typeof postgres>;
  aggregateRoots: TAggregateMap;
  aggregateRootRepository: AggregateRootRepository<
    TAggregateMap,
    TAggregateMapTypes
  >;
}) {
  const txn = await sql.reserve();
  await txn`BEGIN`;
  const command = (await txn<QueuedCommand[]>`SELECT *
              FROM event_core.command_queue
              where status = 'pending'
              ORDER BY id ASC LIMIT 1
              FOR UPDATE SKIP LOCKED`)[0];

  if (!command) {
    await txn`COMMIT`;
    txn.release();
    return;
  }

  try {
    const aggregate = await aggregateRootRepository.retrieve({
      aggregateRootId: command.aggregateRootId,
      aggregateRootType: command.aggregateRootType,
    });

    const commandMap = aggregateRoots[command.aggregateRootType].commands;
    const commandFunction = commandMap[command.commandName as keyof typeof commandMap];

    const commandResult = commandFunction(aggregate.state, command.commandData as never);
    const raisedEvents = Array.isArray(commandResult) ? commandResult : [commandResult];

    // When completing the command fails, the events persisted by this call may still be inserted.
    // A more durable solution would integrate the inserts done here with the command transaction.
    await aggregateRootRepository.persist({
      aggregateRoot: aggregate,
      pendingEventPayloads: raisedEvents,
    });

    await txn`UPDATE event_core.command_queue SET status = 'complete' WHERE id = ${command.id}`;
  } catch {
    await txn`UPDATE event_core.command_queue SET attempts = ${
      command.attempts + 1
    } WHERE id = ${command.id}`;
  } finally {
    await txn`COMMIT`;
    txn.release();
  }
}
