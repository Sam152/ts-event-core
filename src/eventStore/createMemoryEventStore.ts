import { EventStore } from "./EventStore.ts";

export function createMemoryEventStore(): EventStore<unknown> {
  /**
   * A map of aggregate IDs to an array of events.
   */
  const events: Record<string, unknown[]> = {};

  return {};
}
