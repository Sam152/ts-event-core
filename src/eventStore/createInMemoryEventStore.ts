import { Event, EventStore } from "./EventStore.ts";
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
  const storageByAggregate: Record<string, TEvent[]> = {};
  const storageByInsertOrder: TEvent[] = [];
  const subscribers: EventSubscriber<TEvent>[] = [];

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

        storageByAggregate[key].push(event);
        storageByInsertOrder.push(event);

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
      // Slice by storageByInsertOrder and yield results.
    },
  };
}

function streamKey(aggregateType: string, aggregateId: string): string {
  return `${aggregateType}:${aggregateId}`;
}
