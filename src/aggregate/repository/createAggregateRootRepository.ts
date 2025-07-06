import { EventStore } from "../../eventStore/EventStore.ts";
import { AggregateRootRepository } from "../AggregateRootRepository.ts";
import { AggregateRootDefinitionMap, EventsRaisedByAggregateRoots } from "../AggregateRootDefinition.ts";

/**
 * This aggregate root repository loads the whole event stream for an aggregate root,
 * and reduces them on demand. This can be suitable for use cases where an aggregate
 * root has a limited number of events.
 */
export function createAggregateRootRepository<TAggregateDefinitionMap extends AggregateRootDefinitionMap>(
  { eventStore, aggregateRoots }: {
    eventStore: EventStore<EventsRaisedByAggregateRoots<TAggregateDefinitionMap>>;
    aggregateRoots: TAggregateDefinitionMap;
  },
): AggregateRootRepository<TAggregateDefinitionMap> {
  return {
    retrieve: async (
      { aggregateRootId, aggregateRootType },
    ) => {
      const definition = aggregateRoots[aggregateRootType];
      const events = await eventStore.retrieve({
        aggregateRootId,
        aggregateRootType: aggregateRootType as string,
      });

      const state = events.map(
        (event) => event.payload,
      ).reduce(
        definition.state.reducer,
        definition.state.initialState,
      );

      return {
        aggregateRootId,
        aggregateRootType,
        aggregateVersion: events.at(-1)?.aggregateVersion,
        state,
      };
    },
    persist: async (
      { aggregate, pendingEvents },
    ) => {
      await eventStore.persist(pendingEvents);
    },
  };
}
