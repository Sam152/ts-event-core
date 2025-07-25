import { Event, EventsRaisedByAggregateRoots, EventStore } from "../../eventStore/EventStore.ts";
import { AggregateRootRepository } from "../AggregateRootRepository.ts";
import { AggregateRootDefinitionMap, AggregateRootDefinitionMapTypes } from "../AggregateRootDefinition.ts";
import { SnapshotStorage } from "../SnapshotStorage.ts";

/**
 * Some aggregates have very large event streams. It can be helpful to take a snapshot of the aggregate to avoid loading
 * a large number of events when retrieving an aggregate.
 */
export function createSnapshottingAggregateRootRepository<
  TAggregateDefinitionMap extends AggregateRootDefinitionMap<TAggregateMapTypes>,
  TAggregateMapTypes extends AggregateRootDefinitionMapTypes = AggregateRootDefinitionMapTypes,
>(
  { eventStore, aggregateRoots, snapshotStorage }: {
    eventStore: EventStore<EventsRaisedByAggregateRoots<TAggregateDefinitionMap, TAggregateMapTypes>>;
    aggregateRoots: TAggregateDefinitionMap;
    snapshotStorage: SnapshotStorage<TAggregateDefinitionMap, TAggregateMapTypes>;
  },
): AggregateRootRepository<TAggregateDefinitionMap, TAggregateMapTypes> {
  return {
    retrieve: async (
      { aggregateRootId, aggregateRootType },
    ) => {
      const definition = aggregateRoots[aggregateRootType];

      const snapshot = await snapshotStorage.retrieve({
        aggregateRootId,
        aggregateRootType,
        aggregateRootStateVersion: definition.state.version,
      });

      const events = eventStore.retrieve({
        aggregateRootId,
        aggregateRootType: aggregateRootType as string,
      });

      let aggregateVersion: number | undefined = undefined;
      let state = definition.state.initialState;
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
