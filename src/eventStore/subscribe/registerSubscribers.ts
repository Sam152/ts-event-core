import { Cursor } from "./Cursor.ts";
import { Event, EventStore } from "../EventStore.ts";

export function pollingEventStoreSubscriberRegistration<TEvent extends Event = Event>(
  { cursor, eventStore, pollIntervalMs }: {
    cursor: Cursor;
    eventStore: EventStore<TEvent>;
    pollIntervalMs: number;
  },
) {
}
