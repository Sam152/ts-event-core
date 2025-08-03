import { LoadedAggregateRoot } from "./LoadedAggregateRoot.ts";
import { AggregateRootDefinitionMap, AggregateRootDefinitionMapTypes } from "./AggregateRootDefinition.ts";

/**
 * Retrieve and persist aggregate roots.
 */
export type AggregateRootRepository<
  TAggregateDefinitionMap extends AggregateRootDefinitionMap<TAggregateMapTypes>,
  TAggregateMapTypes extends AggregateRootDefinitionMapTypes,
> = {
  retrieve: <TAggregateRootType extends keyof TAggregateDefinitionMap>(
    args: { aggregateRootType: TAggregateRootType; aggregateRootId: string },
  ) => Promise<LoadedAggregateRoot<TAggregateRootType, TAggregateDefinitionMap[TAggregateRootType]>>;

  persist: <
    TAggregateRootType extends keyof TAggregateDefinitionMap,
    TAggregateDefinition extends TAggregateDefinitionMap[TAggregateRootType],
    TLoadedAggregateRoot extends LoadedAggregateRoot<TAggregateRootType, TAggregateDefinition>,
  >(
    args: {
      aggregateRoot: TLoadedAggregateRoot;
      pendingEventPayloads: Parameters<TAggregateDefinition["state"]["reducer"]>[1][];
    },
  ) => Promise<void>;
};
