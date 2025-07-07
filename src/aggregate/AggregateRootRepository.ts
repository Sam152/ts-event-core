import { LoadedAggregateRoot } from "./LoadedAggregateRoot.ts";
import { AggregateRootDefinitionMap, AggregateRootDefinitionMapTypes } from "./AggregateRootDefinition.ts";
import { Event } from "../eventStore/EventStore.ts";

/**
 * Retrieve and persist aggregate roots.
 */
export type AggregateRootRepository<
  TAggregateMapTypes extends AggregateRootDefinitionMapTypes,
  TAggregateDefinitionMap extends AggregateRootDefinitionMap<TAggregateMapTypes>,
> = {
  retrieve: <TAggregateRootType extends keyof TAggregateDefinitionMap>(
    args: { aggregateRootType: TAggregateRootType; aggregateRootId: string },
  ) => Promise<LoadedAggregateRoot<TAggregateRootType, TAggregateDefinitionMap[TAggregateRootType]>>;

  persist: <
    TAggregateRootType extends keyof TAggregateDefinitionMap,
    TAggregateDefinition extends TAggregateDefinitionMap[TAggregateRootType],
    TLoadedAggregateRoot extends LoadedAggregateRoot<TAggregateRootType, TAggregateDefinition>,
  >(
    args: { aggregate: TLoadedAggregateRoot; raisedEvents: Event["payload"][] },
  ) => Promise<void>;
};
