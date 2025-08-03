import { Envelope, EventsRaisedByAggregateRoots, EventStore } from "../../eventStore/EventStore.ts";
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
        fromVersion: snapshot && snapshot.aggregateVersion,
      });

      let state = snapshot ? structuredClone(snapshot.state) : definition.state.initialState();
      let aggregateVersion = snapshot ? snapshot.aggregateVersion : undefined;

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
    persist: async ({ aggregateRoot, pendingEvents }) => {
      const envelopes: Envelope[] = pendingEvents.map(
        (payload, i) => ({
          aggregateRootType: aggregateRoot.aggregateRootType as string,
          aggregateRootId: aggregateRoot.aggregateRootId,
          recordedAt: new Date(),
          aggregateVersion: (aggregateRoot.aggregateVersion ?? 0) + (i + 1),
          payload,
        }),
      );

      const definition = aggregateRoots[aggregateRoot.aggregateRootType];
      let state = aggregateRoot.state;
      for await (const envelope of envelopes) {
        state = definition.state.reducer(state, envelope.payload);
      }

      const aggregateRootVersion: number | undefined = envelopes.length > 0
        ? envelopes.at(-1)!.aggregateVersion
        : aggregateRoot.aggregateVersion;

      // In this case we are choosing to snapshot the aggregate, each time new
      // events are persisted. We could choose a strategy of snapshotting every
      // N events, to find a balance between writing aggregates to storage and
      // retrieving events from the event store.
      await snapshotStorage.persist({
        aggregateRootStateVersion: definition.state.version,
        aggregateRoot: {
          state,
          aggregateRootId: aggregateRoot.aggregateRootId,
          aggregateVersion: aggregateRootVersion,
          aggregateRootType: aggregateRoot.aggregateRootType,
        },
      });

      await eventStore.persist(envelopes);
    },
  };
}
