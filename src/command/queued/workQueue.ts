import type postgres from "postgres";
import { runPendingCommandFromQueue } from "./runPendingCommandFromQueue.ts";
import type { AggregateRootRepository } from "../../aggregate/AggregateRootRepository.ts";
import type {
  AggregateRootDefinitionMap,
  AggregateRootDefinitionMapTypes,
} from "../../aggregate/AggregateRootDefinition.ts";
import { wait } from "../../util/wait.ts";
import { withTxn } from "@ts-event-core/framework";

export type QueueSignal = { status: "WORKING" | "HALTED" };

const POLLING_SLEEP_MS = 5;

export async function workQueue<
  TAggregateMap extends AggregateRootDefinitionMap<TAggregateMapTypes>,
  TAggregateMapTypes extends AggregateRootDefinitionMapTypes,
>(
  { signal, sql, aggregateRoots, aggregateRootRepository }: {
    signal: QueueSignal;
    sql: ReturnType<typeof postgres>;
    aggregateRoots: TAggregateMap;
    aggregateRootRepository: AggregateRootRepository<
      TAggregateMap,
      TAggregateMapTypes
    >;
  },
) {
  while (signal.status === "WORKING") {
    try {
      await withTxn(sql, async () => {
        await runPendingCommandFromQueue({ aggregateRoots, aggregateRootRepository });
      });
    } catch {
      // All data created or updated while running a command from the queue is within a
      // transaction. Any errors thrown will result in a rollback and the command being
      // run again.
      // @todo - log an error.
    }
    await wait(POLLING_SLEEP_MS);
  }
}
