import type { Event, EventsRaisedByAggregateRoots, EventStore } from "../../eventStore/EventStore.ts";
import type { AggregateRootRepository } from "../AggregateRootRepository.ts";
import type { AggregateRootDefinitionMap, AggregateRootDefinitionMapTypes } from "../AggregateRootDefinition.ts";
import type { SnapshotStorage } from "../SnapshotStorage.ts";

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
        stateVersion: definition.state.version,
      });

      const events = eventStore.retrieve({
        aggregateRootId,
        aggregateRootType: aggregateRootType as string,
        fromVersion: snapshot && snapshot.aggregateVersion,
      });

      let state = structuredClone(snapshot ? snapshot.state : definition.state.initialState);
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

      const definition = aggregateRoots[aggregateRoot.aggregateRootType];
      let state = aggregateRoot.state;
      for await (const event of events) {
        state = definition.state.reducer(state, event.payload);
      }

      const aggregateRootVersion: number | undefined = events.length > 0
        ? events.at(-1)!.aggregateVersion
        : aggregateRoot.aggregateVersion;

      // Persist events first, such that we can be sure there were no integrity
      // violations.
      await eventStore.persist(events);

      // Persist a snapshot for this aggregate to storage. Depending on the size of
      // the state, we could choose to do this less often only persist snapshots for
      // every N events raised. This does not require a transaction, since the system
      // will self recover in the event a snapshot cannot be persisted.
      await snapshotStorage.persist({
        stateVersion: definition.state.version,
        aggregateRoot: {
          state,
          aggregateRootId: aggregateRoot.aggregateRootId,
          aggregateVersion: aggregateRootVersion,
          aggregateRootType: aggregateRoot.aggregateRootType,
        },
      });
    },
  };
}
