import { AggregateRootDefinitionMap, AggregateRootDefinitionMapTypes } from "../AggregateRootDefinition.ts";
import { SnapshotStorage } from "../SnapshotStorage.ts";
import postgres from "postgres";

/**
 * A Postgres implementation of snapshot storage.
 *
 * This may be useful for aggregates whose event streams get very long and whose projections
 * do not change frequently. Having persistent snapshot storage may
 */
export function createPostgresSnapshotStorage<
  TAggregateDefinitionMap extends AggregateRootDefinitionMap<TAggregateMapTypes>,
  TAggregateMapTypes extends AggregateRootDefinitionMapTypes,
>(
  { connection: sql }: { connection: ReturnType<typeof postgres> },
): SnapshotStorage<TAggregateDefinitionMap, TAggregateMapTypes> {
  return {
    persist: async ({
      aggregateRoot,
      aggregateRootStateVersion,
    }) => {
      // @todo
    },
    // @ts-ignore @todo
    retrieve: async ({
      aggregateRootType,
      aggregateRootId,
      aggregateRootStateVersion,
    }) => {
    },
  };
}
