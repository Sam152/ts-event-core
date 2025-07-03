import { Event, EventStore } from "./EventStore.ts";
import { UniqueConstraintViolationError } from "./UniqueConstraintViolationError.ts";

export function createMemoryEventStore<TEvent extends Event<unknown>>(): EventStore<TEvent> {
  const storage: Record<string, TEvent[]> = {};
  const streamKey = (aggregateType: string, aggregateId: string) => `${aggregateType}:${aggregateId}`;
  return {
    persist: async (events) => {
      events.forEach((event) => {
        const key = streamKey(event.aggregateType, event.aggregateId);
        storage[key] = storage[key] ?? [];

        if (storage[key].some((existing) => existing.aggregateVersion === event.aggregateVersion)) {
          throw new UniqueConstraintViolationError();
        }

        storage[key].push(event);
      });
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
