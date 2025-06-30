import { EventEnvelope, EventStore } from "./EventStore.ts";
import { UniqueConstraintViolationError } from "./UniqueConstraintViolationError.ts";

export function createMemoryEventStore<TEventType>(): EventStore<TEventType> {
  const storage: Record<string, EventEnvelope<TEventType>[]> = {};
  const createKey = (aggregateType: string, aggregateId: string) => `${aggregateType}:${aggregateId}`;

  return {
    persist: async (events) => {
      events.forEach((event) => {
        const key = createKey(event.aggregateType, event.aggregateId);
        if (!storage[key]) {
          storage[key] = [];
        }

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
      const key = createKey(aggregateType, aggregateId);
      const events = storage[key] || [];
      return Promise.resolve(
        fromVersion !== undefined ? events.filter((event) => event.aggregateVersion >= fromVersion) : events,
      );
    },
  };
}
