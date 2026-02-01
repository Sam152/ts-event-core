import type postgres from "postgres";
import { wait } from "../../../test/integration/utils/wait.ts";
import { runPendingCommandFromQueue } from "./runPendingCommandFromQueue.ts";
import type { AggregateRootRepository } from "../../aggregate/AggregateRootRepository.ts";
import type {
  AggregateRootDefinitionMap,
  AggregateRootDefinitionMapTypes,
} from "../../aggregate/AggregateRootDefinition.ts";

export type QueueSignal = { status: "WORKING" | "HALTED" };

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
    await runPendingCommandFromQueue({ sql, aggregateRoots, aggregateRootRepository });
    await wait(5);
  }
}
