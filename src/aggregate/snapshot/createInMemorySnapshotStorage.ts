import {
  AggregateRootDefinition,
  AggregateRootDefinitionMap,
  AggregateRootDefinitionMapTypes,
  AggregateStateVersion,
} from "../AggregateRootDefinition.ts";
import { SnapshotStorage } from "../SnapshotStorage.ts";
import { AggregateRootInstance } from "../AggregateRootInstance.ts";

/**
 * An in-memory implementation of snapshot storage.
 *
 * Unlike an event store, in-memory snapshot storage can be a useful concept in production
 * because having snapshots stored in memory for the duration of the process saves a lot
 * of traffic to the database over the lifetime of the process. This is provided the application
 * can tolerate a "warm up" for each aggregate root, where on first load, all events will still
 * be loaded and reduced.
 *
 * For cases where too many events exist to replay and reduce on demand, persistent snapshot
 * storage can be used.
 */
export function createInMemorySnapshotStorage<
  TAggregateDefinitionMap extends AggregateRootDefinitionMap<TAggregateMapTypes>,
  TAggregateMapTypes extends AggregateRootDefinitionMapTypes,
>(): SnapshotStorage<TAggregateDefinitionMap, TAggregateMapTypes> {
  const storage: Record<string, AggregateRootInstance<unknown, AggregateRootDefinition<unknown, unknown>>> =
    {};

  return {
    persist: async ({
      aggregateRoot,
      stateVersion,
    }) => {
      const key = snapshotKey(
        aggregateRoot.aggregateRootType as string,
        aggregateRoot.aggregateRootId,
        stateVersion,
      );
      storage[key] = aggregateRoot;
    },
    retrieve: async ({
      aggregateRootType,
      aggregateRootId,
      stateVersion,
    }) => {
      const key = snapshotKey(aggregateRootType as string, aggregateRootId, stateVersion);
      return storage[key] as AggregateRootInstance<
        typeof aggregateRootType,
        AggregateRootDefinition<
          unknown,
          unknown
        >
      >;
    },
  };
}

function snapshotKey(
  aggregateType: string,
  aggregateId: string,
  aggregateRootStateVersion: AggregateStateVersion,
): string {
  return `${aggregateType}:${aggregateId}:${aggregateRootStateVersion}`;
}
