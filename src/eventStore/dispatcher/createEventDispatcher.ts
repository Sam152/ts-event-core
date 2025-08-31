import { Cursor } from "./Cursor.ts";
import { Event, EventStore } from "../EventStore.ts";

export function createEventDispatcher<TEvent extends Event = Event>(
  { cursor }: { cursor: Cursor; eventStore: EventStore<TEvent> },
) {
}
