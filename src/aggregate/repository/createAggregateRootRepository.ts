import { Event, EventsRaisedByAggregateRoots, EventStore } from "../../eventStore/EventStore.ts";
import { AggregateRootRepository } from "../AggregateRootRepository.ts";
import { AggregateRootDefinitionMap, AggregateRootDefinitionMapTypes } from "../AggregateRootDefinition.ts";

/**
 * This aggregate root repository loads the whole event stream for an aggregate root,
 * and reduces them on demand. This can be suitable for use cases where an aggregate
 * root has a limited number of events.
 */
export function createAggregateRootRepository<
  TAggregateDefinitionMap extends AggregateRootDefinitionMap<TAggregateMapTypes>,
  TAggregateMapTypes extends AggregateRootDefinitionMapTypes = AggregateRootDefinitionMapTypes,
>(
  { eventStore, aggregateRoots }: {
    eventStore: EventStore<EventsRaisedByAggregateRoots<TAggregateDefinitionMap, TAggregateMapTypes>>;
    aggregateRoots: TAggregateDefinitionMap;
  },
): AggregateRootRepository<TAggregateMapTypes, TAggregateDefinitionMap> {
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
    persist: async ({ aggregate, pendingPayloads }) => {
      const pendingEvents: Event[] = pendingPayloads.map(
        (payload, i) => ({
          aggregateRootType: aggregate.aggregateRootType as string,
          aggregateRootId: aggregate.aggregateRootId,
          recordedAt: new Date(),
          aggregateVersion: (aggregate.aggregateVersion ?? 0) + (i + 1),
          payload,
        }),
      );
      await eventStore.persist(pendingEvents);
    },
  };
}
