import { Event, EventStore } from "../EventStore.ts";
import { AggregateDataConsistencyError } from "../AggregateDataConsistencyError.ts";

type EventSubscriber<TEvent extends Event<unknown>> = (event: TEvent) => Promise<void> | void;
type EventEmitter<TEvent extends Event<unknown>> = {
  addSubscriber: (subscriber: EventSubscriber<TEvent>) => void;
};

export function createMemoryEventStore<TEvent extends Event<unknown>>():
  & EventStore<TEvent>
  & EventEmitter<TEvent> {
  const storage: Record<string, TEvent[]> = {};
  const subscribers: EventSubscriber<TEvent>[] = [];

  return {
    addSubscriber: subscribers.push,
    persist: async (events) => {
      await Promise.all(events.map(async (event) => {
        const key = streamKey(event.aggregateType, event.aggregateId);
        storage[key] = storage[key] ?? [];

        if (storage[key].some((existing) => existing.aggregateVersion === event.aggregateVersion)) {
          throw new AggregateDataConsistencyError();
        }

        storage[key].push(event);
        await Promise.all(subscribers?.map((subscriber) => subscriber(event)) ?? []);
      }));
    },
    retrieve: ({
      aggregateType,
      aggregateId,
      fromVersion,
    }) => {
      const key = streamKey(aggregateType, aggregateId);
      const events = storage[key] || [];
      return Promise.resolve(
        fromVersion !== undefined ? events.filter((event) => event.aggregateVersion > fromVersion) : events,
      );
    },
  };
}

function streamKey(aggregateType: string, aggregateId: string): string {
  return `${aggregateType}:${aggregateId}`;
}
