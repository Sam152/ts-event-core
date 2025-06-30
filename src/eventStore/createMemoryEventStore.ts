import { EventEnvelope, EventStore } from "./EventStore.ts";
import { UniqueConstraintViolationError } from "./UniqueConstraintViolationError.ts";

export function createMemoryEventStore(): EventStore<unknown> {
  const storage: Record<string, EventEnvelope<unknown>[]> = {};
  const createKey = (aggregateType: string, aggregateId: string) => `${aggregateType}:${aggregateId}`;

  return {
    persist: (events) => {
      events.forEach((event) => {
        const key = createKey(event.aggregateType, event.aggregateId);
        const existingEvents = storage[key] || [];

        if (existingEvents.some((existing) => existing.aggregateVersion === event.aggregateVersion)) {
          throw new UniqueConstraintViolationError();
        }

        storage[key].push(event);
      });
      return Promise.resolve();
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
