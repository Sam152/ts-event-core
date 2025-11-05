import { AggregateRootInstance } from "./AggregateRootInstance.ts";
import { AggregateRootDefinitionMap, AggregateRootDefinitionMapTypes } from "./AggregateRootDefinition.ts";

/**
 * An `CommandIssuer` is responsible for loading aggregate state and persisting any pending events which
 * were recorded as the result of processing a command with the loaded state.
 */
export type AggregateRootRepository<
  TAggregateDefinitionMap extends AggregateRootDefinitionMap<TAggregateMapTypes>,
  TAggregateMapTypes extends AggregateRootDefinitionMapTypes,
> = {
  retrieve: <TAggregateRootType extends keyof TAggregateDefinitionMap>(
    args: { aggregateRootType: TAggregateRootType; aggregateRootId: string },
  ) => Promise<AggregateRootInstance<TAggregateRootType, TAggregateDefinitionMap[TAggregateRootType]>>;

  persist: <
    TAggregateRootType extends keyof TAggregateDefinitionMap,
    TAggregateDefinition extends TAggregateDefinitionMap[TAggregateRootType],
    TLoadedAggregateRoot extends AggregateRootInstance<TAggregateRootType, TAggregateDefinition>,
  >(
    args: {
      aggregateRoot: TLoadedAggregateRoot;
      pendingEventPayloads: Parameters<TAggregateDefinition["state"]["reducer"]>[1][];
    },
  ) => Promise<void>;
};
