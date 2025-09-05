import { Cursor } from "./Cursor.ts";
import { Event, EventStore, PersistedEvent } from "../EventStore.ts";
import { wait } from "../../util/wait.ts";
import stat = Deno.stat;

type Subscribers<TEvent extends Event> = Array<(event: TEvent) => Promise<void> | void>;

export function registerPollingSubscribers<TEvent extends Event = Event>(
  { cursor, eventStore, pollIntervalMs = 50, subscribers }: {
    cursor: Cursor;
    eventStore: EventStore<TEvent>;
    pollIntervalMs?: number;
    subscribers: Subscribers<TEvent>;
  },
): { halt: () => Promise<void> } {
  let status: "ACTIVE" | "HALTED" = "ACTIVE";
  let lastTimer: number;
  let lastInvocation: Promise<void>;

  const processBatch = async () => {
    if (status !== "ACTIVE") {
      return;
    }

    const position = await cursor.position();
    const events = eventStore.retrieveAll({
      idGt: position,
      limit: 1000,
    });
    const result = await callSubscribersSerial({
      subscribers,
      events,
    });

    if (result.outcome === "PROCESSED_BATCH") {
      await cursor.update(result.newPosition);
      // Immediately poll for the next batch in cases where we processed a batch, such that
      // if we are processing a long stream of events, we aren't held up by the interval.
      lastTimer = setTimeout(() => {
        lastInvocation = processBatch();
      }, 0);
    }

    if (result.outcome === "NO_EVENTS_PROCESSED") {
      await cursor.update(position);
      lastTimer = setTimeout(() => {
        lastInvocation = processBatch();
      }, pollIntervalMs);
    }
  };

  lastInvocation = processBatch();

  return {
    halt: async () => {
      status = "HALTED";
      await lastInvocation;
      clearTimeout(lastTimer);
    },
  };
}

async function callSubscribersSerial<TEvent extends Event = Event>(
  { events, subscribers }: {
    events: AsyncGenerator<PersistedEvent<TEvent>>;
    subscribers: Subscribers<TEvent>;
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
