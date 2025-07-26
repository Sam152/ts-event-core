import { Envelope, EventStore } from "../EventStore.ts";
import { AggregateDataConsistencyError } from "../error/AggregateDataConsistencyError.ts";

type EventSubscriber<TEvent extends Envelope> = (event: TEvent) => Promise<void> | void;
type EventEmitter<TEvent extends Envelope> = {
  addSubscriber: (subscriber: EventSubscriber<TEvent>) => void;
};

export function createMemoryEventStore<TEvent extends Envelope>():
  & EventStore<TEvent>
  & EventEmitter<TEvent> {
  const storage: Record<string, TEvent[]> = {};
  const subscribers: EventSubscriber<TEvent>[] = [];

  return {
    addSubscriber: subscribers.push.bind(subscribers),
    persist: async (events) => {
      await Promise.all(events.map(async (event) => {
        const key = streamKey(event.aggregateRootType, event.aggregateRootId);
        storage[key] = storage[key] ?? [];

        if (storage[key].some((existing) => existing.aggregateVersion === event.aggregateVersion)) {
          throw new AggregateDataConsistencyError();
        }

        storage[key].push(event);
        await Promise.all(subscribers?.map((subscriber) => subscriber(event)) ?? []);
      }));
    },
    retrieve: async function* ({
      aggregateRootType,
      aggregateRootId,
      fromVersion,
    }) {
      const key = streamKey(aggregateRootType, aggregateRootId);
      const events = storage[key] || [];
      yield* (
        fromVersion !== undefined ? events.filter((event) => event.aggregateVersion > fromVersion) : events
      );
    },
  };
}

function streamKey(aggregateType: string, aggregateId: string): string {
  return `${aggregateType}:${aggregateId}`;
}
