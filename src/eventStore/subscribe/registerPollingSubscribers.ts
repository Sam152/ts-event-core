import { Cursor } from "./Cursor.ts";
import { Event, EventStore, PersistedEvent } from "../EventStore.ts";
import { wait } from "../../util/wait.ts";

export function registerPollingSubscribers<TEvent extends Event = Event>(
  { cursor, eventStore, pollIntervalMs = 50, subscribers }: {
    cursor: Cursor;
    eventStore: EventStore<TEvent>;
    pollIntervalMs?: number;
    subscribers: Array<(event: TEvent) => Promise<void>>;
  },
): { halt: () => void } {
  const processBatch = async () => {
    const position = await cursor.position();
    const events = eventStore.retrieveAll({
      idGt: position,
      limit: 1000,
    });
    const result = await callSubscribersSerial({
      subscribers,
      events,
    });

    await cursor.update(result.outcome === "PROCESSED_BATCH" ? result.newPosition : position);
    await wait(pollIntervalMs);
  };

  const interval = setInterval(processBatch, 0);
  return {
    halt: () => clearInterval(interval),
  };
}

async function callSubscribersSerial<TEvent extends Event = Event>(
  { events, subscribers }: {
    events: AsyncGenerator<PersistedEvent<TEvent>>;
    subscribers: Array<(event: TEvent) => Promise<void>>;
  },
): Promise<{ outcome: "NO_EVENTS_PROCESSED" } | { outcome: "PROCESSED_BATCH"; newPosition: number }> {
  let newPosition = -1;
  for await (const event of events) {
    await subscribers.reduce(async (acc, subscriber) => {
      await acc;
      await subscriber(event);
      newPosition = event.id;
    }, Promise.resolve());
  }
  return newPosition === -1
    ? { outcome: "NO_EVENTS_PROCESSED" }
    : { outcome: "PROCESSED_BATCH", newPosition };
}
