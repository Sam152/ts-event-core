import { EventStore } from "../../eventStore/EventStore.ts";
import { AggregateRootRepository } from "../AggregateRootRepository.ts";
import { AggregateRootDefinitionMap } from "../AggregateRootDefinition.ts";
import { LoadedAggregateRoot } from "../LoadedAggregateRoot.ts";

export function createAggregateRootRepository<TAggregateDefinitionMap extends AggregateRootDefinitionMap>(
  { eventStore, aggregateRoots }: { eventStore: EventStore; aggregateRoots: TAggregateDefinitionMap },
): AggregateRootRepository<TAggregateDefinitionMap> {
  return {
    retrieve: async (
      { aggregateRootId, aggregateRootType },
    ) => {
      const definition = aggregateRoots[aggregateRootType];
      const events = await eventStore.retrieve({ aggregateRootId, aggregateRootType });

      return {} as LoadedAggregateRoot<any, any>;
    },
    persist: async (
      { aggregate, pendingEvents },
    ) => {},
  };
}
