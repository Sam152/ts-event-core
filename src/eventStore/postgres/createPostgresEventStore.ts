import { Envelope, EventStore } from "../EventStore.ts";

export function createPostgresEventStore<TEvent extends Envelope>(
  { connection }: { connection: number },
): EventStore<TEvent> {
  return {
    persist: async (events) => {
    },
    retrieve: async function* ({
      aggregateRootType,
      aggregateRootId,
      fromVersion,
    }) {
    },
  };
}
