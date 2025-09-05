import { Event, EventStore, PersistedEvent } from "./EventStore.ts";
import { AggregateRootVersionIntegrityError } from "./error/AggregateRootVersionIntegrityError.ts";

type EventSubscriber<TEvent extends Event> = (event: TEvent) => Promise<void> | void;
type EventEmitter<TEvent extends Event> = {
  addSubscriber: (subscriber: EventSubscriber<TEvent>) => void;
};

/**
 * An in-memory test store is most useful for testing purposes. Most use cases
 * would benefit from persistent storage.
 */
export function createInMemoryEventStore<TEvent extends Event>():
  & EventStore<TEvent>
  & EventEmitter<TEvent> {
  const storageByAggregate: Record<string, PersistedEvent<TEvent>[]> = {};
  const storageByInsertOrder: PersistedEvent<TEvent>[] = [];
  const subscribers: EventSubscriber<TEvent>[] = [];

  let idSequence = 0;

  return {
    addSubscriber: subscribers.push.bind(subscribers),
    persist: async (events) => {
      await Promise.all(events.map(async (event) => {
        const key = streamKey(event.aggregateRootType, event.aggregateRootId);
        storageByAggregate[key] = storageByAggregate[key] ?? [];

        if (
          storageByAggregate[key].some((existing) => existing.aggregateVersion === event.aggregateVersion)
        ) {
          throw new AggregateRootVersionIntegrityError();
        }

        const id = idSequence++;
        const persistedEvent = {
          id,
          ...event,
        };

        storageByAggregate[key].push(persistedEvent);
        storageByInsertOrder.push(persistedEvent);

        await Promise.all(subscribers?.map((subscriber) => subscriber(event)) ?? []);
      }));
    },
    retrieve: async function* ({
      aggregateRootType,
      aggregateRootId,
      fromVersion,
    }) {
      const key = streamKey(aggregateRootType, aggregateRootId);
      const events = storageByAggregate[key] || [];
      yield* (
        fromVersion !== undefined ? events.filter((event) => event.aggregateVersion > fromVersion) : events
      );
    },
    retrieveAll: async function* ({
      idGt,
      limit,
    }) {
      yield* storageByInsertOrder.slice(idGt, idGt + limit);
    },
  };
}

function streamKey(aggregateType: string, aggregateId: string): string {
  return `${aggregateType}:${aggregateId}`;
}
