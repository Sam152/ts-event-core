import { LoadedAggregateRoot } from "./LoadedAggregateRoot.ts";
import { AggregateRootDefinitionMap } from "./AggregateRootDefinition.ts";
import { Event } from "../eventStore/EventStore.ts";

export type AggregateRepository<TAggregateDefinitionMap extends AggregateRootDefinitionMap> = {
  retrieve: <TType extends keyof TAggregateDefinitionMap>(
    args: { type: TType; id: string },
  ) => Promise<LoadedAggregateRoot<TAggregateDefinitionMap[TType]>>;

  persist: <
    TAggregateDefinition extends TAggregateDefinitionMap[keyof TAggregateDefinitionMap],
    TLoadedAggregateRoot extends LoadedAggregateRoot<TAggregateDefinition>,
  >(
    aggregate: TLoadedAggregateRoot,
    events: Event[],
  ) => Promise<void>;
};
