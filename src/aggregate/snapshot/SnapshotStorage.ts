import {
    AggregateRootDefinitionMap,
    AggregateRootDefinitionMapTypes,
    AggregateStateVersion,
} from "../AggregateRootDefinition.ts";

export type SnapshotStorage<
  TAggregateMapTypes extends AggregateRootDefinitionMapTypes,
  TAggregateDefinitionMap extends AggregateRootDefinitionMap<TAggregateMapTypes>,
> = {
  retrieve: <TAggregateRootType extends keyof TAggregateDefinitionMap>(
    args: {
      aggregateRootType: TAggregateRootType;
      aggregateRootId: string;
      aggregateRootStateVersion: AggregateStateVersion;
    },
  ) => Promise<undefined | ReturnType<TAggregateDefinitionMap[TAggregateRootType]["state"]["reducer"]>>;

  persist: <
    TAggregateRootType extends keyof TAggregateDefinitionMap,
    TAggregateDefinition extends TAggregateDefinitionMap[TAggregateRootType],
  >(
    args: {
      aggregateRootType: TAggregateRootType;
      aggregateRootId: string;
      aggregateRootStateVersion: AggregateStateVersion;
      state: ReturnType<TAggregateDefinitionMap[TAggregateRootType]["state"]["reducer"]>;
    },
  ) => Promise<void>;
};
