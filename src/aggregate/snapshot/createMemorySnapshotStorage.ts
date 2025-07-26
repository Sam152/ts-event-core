import {
  AggregateRootDefinition,
  AggregateRootDefinitionMap,
  AggregateRootDefinitionMapTypes,
  AggregateStateVersion,
} from "../AggregateRootDefinition.ts";
import { SnapshotStorage } from "../SnapshotStorage.ts";
import { LoadedAggregateRoot } from "../LoadedAggregateRoot.ts";

export function createMemorySnapshotStorage<
  TAggregateDefinitionMap extends AggregateRootDefinitionMap<TAggregateMapTypes>,
  TAggregateMapTypes extends AggregateRootDefinitionMapTypes,
>(): SnapshotStorage<TAggregateDefinitionMap, TAggregateMapTypes> {
  const storage: Record<string, LoadedAggregateRoot<unknown, AggregateRootDefinition<unknown, unknown>>> = {};

  return {
    persist: async ({
      aggregateRoot,
      aggregateRootStateVersion,
    }) => {
      const key = snapshotKey(
        aggregateRoot.aggregateRootType as string,
        aggregateRoot.aggregateRootId,
        aggregateRootStateVersion,
      );
      storage[key] = aggregateRoot;
    },
    retrieve: async ({
      aggregateRootType,
      aggregateRootId,
      aggregateRootStateVersion,
    }) => {
      const key = snapshotKey(aggregateRootType as string, aggregateRootId, aggregateRootStateVersion);
      return storage[key] as LoadedAggregateRoot<
        typeof aggregateRootType,
        AggregateRootDefinition<unknown, unknown>
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
