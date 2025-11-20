import type { Event, EventStore, PersistedEvent } from "./EventStore.ts";
import { AggregateRootVersionIntegrityError } from "./error/AggregateRootVersionIntegrityError.ts";

type EventSubscriber<TEvent extends Event> = (event: TEvent) => Promise<void> | void;

/**
 * An in-memory test store is most useful for testing purposes. Most use cases
 * would benefit from persistent storage.
 */
export function createInMemoryEventStore<TEvent extends Event>(): EventStore<TEvent> {
  const storage: PersistedEvent<TEvent>[] = [];
  const aggregateTypeAndIdIndex: Record<string, PersistedEvent<TEvent>[]> = {};

  let idSequence = 0n;

  return {
    persist: async (events) => {
      const sequenced = events.map((event) => ({
        ...event,
        id: ++idSequence,
      }));

      const hasVersionConflict = sequenced.some((event) =>
        (aggregateTypeAndIdIndex[streamKey(event.aggregateRootType, event.aggregateRootId)] ?? []).some((
          existing,
        ) => existing.aggregateVersion === event.aggregateVersion)
      );
      if (hasVersionConflict) {
        throw new AggregateRootVersionIntegrityError();
      }

      sequenced.forEach((event) => {
        const key = streamKey(event.aggregateRootType, event.aggregateRootId);
        aggregateTypeAndIdIndex[key] = aggregateTypeAndIdIndex[key] ?? [];
        aggregateTypeAndIdIndex[key].push(event);
        storage.push(event);
      });
    },
    retrieve: async function* ({
      aggregateRootType,
      aggregateRootId,
      fromVersion,
    }) {
      const key = streamKey(aggregateRootType, aggregateRootId);
      const events = aggregateTypeAndIdIndex[key] || [];
      yield* (
        fromVersion !== undefined ? events.filter((event) => event.aggregateVersion > fromVersion) : events
      );
    },
    retrieveAll: async function* ({
      idGt,
      limit,
    }) {
      yield* storage.slice(Number(idGt), Number(idGt) + limit);
    },
  };
}

function streamKey(aggregateType: string, aggregateId: string): string {
  return `${aggregateType}:${aggregateId}`;
}
