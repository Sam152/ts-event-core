import { Cursor } from "./Cursor.ts";
import { Event, EventStore } from "../EventStore.ts";

export function pollingSubscriberRegistration<TEvent extends Event = Event>(
  { cursor, eventStore, pollIntervalMs }: {
    cursor: Cursor;
    eventStore: EventStore<TEvent>;
    pollIntervalMs: number;
    subscribers: Array<(event: TEvent) => Promise<void>>;
  },
) {
  const pollAndProcessEvents = async () => {
    // const events = eventStore.retrieve();
  };

  setInterval(() => {
  }, pollIntervalMs);
}
