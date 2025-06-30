import { EventEnvelope, EventStore } from "./EventStore.ts";

export function createMemoryEventStore(): EventStore<unknown> {
  /**
   * A map of aggregate IDs to an array of events.
   */
  const storage: Record<string, EventEnvelope<unknown>[]> = {};

  return {
    persist: async (events) => {
    },
    retrieve: async ({
      aggregateType,
      aggregateId,
      fromVersion,
    }) => {
      return [];
    },
  };
}
