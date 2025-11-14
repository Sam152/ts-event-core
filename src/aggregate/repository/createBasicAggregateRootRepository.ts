import type { Event, EventsRaisedByAggregateRoots, EventStore } from "../../eventStore/EventStore.ts";
import type { AggregateRootRepository } from "../AggregateRootRepository.ts";
import type { AggregateRootDefinitionMap, AggregateRootDefinitionMapTypes } from "../AggregateRootDefinition.ts";

/**
 * This aggregate root repository loads the whole event stream for an aggregate root,
 * and reduces them on demand. This can be suitable for use cases where an aggregate
 * root has a limited number of events.
 */
export function createBasicAggregateRootRepository<
  TAggregateDefinitionMap extends AggregateRootDefinitionMap<TAggregateMapTypes>,
  TAggregateMapTypes extends AggregateRootDefinitionMapTypes = AggregateRootDefinitionMapTypes,
>(
  { eventStore, aggregateRoots }: {
    eventStore: EventStore<EventsRaisedByAggregateRoots<TAggregateDefinitionMap, TAggregateMapTypes>>;
    aggregateRoots: TAggregateDefinitionMap;
  },
): AggregateRootRepository<TAggregateDefinitionMap, TAggregateMapTypes> {
  return {
    retrieve: async (
      { aggregateRootId, aggregateRootType },
    ) => {
      const definition = aggregateRoots[aggregateRootType];
      const events = eventStore.retrieve({
        aggregateRootId,
        aggregateRootType: aggregateRootType as string,
      });

      let aggregateVersion: number | undefined = undefined;
      let state = structuredClone(definition.state.initialState);
      for await (const event of events) {
        state = definition.state.reducer(state, event.payload);
        aggregateVersion = event.aggregateVersion;
      }

      return {
        aggregateRootId,
        aggregateRootType,
        aggregateVersion,
        state,
      };
    },
    persist: async ({ aggregateRoot, pendingEventPayloads }) => {
      const events: Event[] = pendingEventPayloads.map(
        (payload, i) => ({
          aggregateRootType: aggregateRoot.aggregateRootType as string,
          aggregateRootId: aggregateRoot.aggregateRootId,
          recordedAt: new Date(),
          aggregateVersion: (aggregateRoot.aggregateVersion ?? 0) + (i + 1),
          payload,
        }),
      );
      await eventStore.persist(events);
    },
  };
}
