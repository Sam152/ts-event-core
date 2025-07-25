import {
  AggregateRootDefinitionMap,
  AggregateRootDefinitionMapTypes,
  AggregateStateVersion,
} from "../AggregateRootDefinition.ts";
import { SnapshotStorage } from "../SnapshotStorage.ts";

export function createMemorySnapshotStorage<
  TAggregateDefinitionMap extends AggregateRootDefinitionMap<TAggregateMapTypes>,
  TAggregateMapTypes extends AggregateRootDefinitionMapTypes,
>(): SnapshotStorage<TAggregateDefinitionMap, TAggregateMapTypes> {
  const storage: Record<string, TAggregateDefinitionMap> = {};
  return {
    persist: async ({
      aggregateRootType,
      aggregateRootId,
      aggregateRootStateVersion,
      state,
    }) => {
      const key = snapshotKey(aggregateRootType as string, aggregateRootId, aggregateRootStateVersion);
      storage[key] = state;
    },
    retrieve: async ({
      aggregateRootType,
      aggregateRootId,
      aggregateRootStateVersion,
    }) => {
      const key = snapshotKey(aggregateRootType as string, aggregateRootId, aggregateRootStateVersion);
      return storage[key] as
        | ReturnType<TAggregateDefinitionMap[typeof aggregateRootType]["state"]["reducer"]>
        | undefined;
    },
  };
}

function snapshotKey(aggregateType: string, aggregateId: string, version: AggregateStateVersion): string {
  return `${aggregateType}:${aggregateId}:${version}`;
}
