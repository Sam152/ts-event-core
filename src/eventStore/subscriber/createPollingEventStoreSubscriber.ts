import type { CursorPosition } from "../cursor/CursorPosition.ts";
import type { Event, EventStore, PersistedEvent } from "../EventStore.ts";
import type { EventStoreSubscriber, Subscriber } from "./EventStoreSubscriber.ts";

type Subscribers<TEvent extends Event> = Array<(event: TEvent) => Promise<void> | void>;

/**
 * Subscribe to events in the event store, using polling, according to the semantics
 * of the provided cursor.
 */
export function createPollingEventStoreSubscriber<TEvent extends Event = Event>(
  { cursor, eventStore, pollIntervalMs = 50 }: {
    cursor: CursorPosition;
    eventStore: EventStore<TEvent>;
    pollIntervalMs?: number;
  },
): EventStoreSubscriber<TEvent> {
  const subscribers: Subscriber<TEvent>[] = [];
  let status: "IDLE" | "POLLING" | "HALTED" | "HALTING" = "IDLE";

  let lastTimer: number;
  let lastInvocation: Promise<void>;

  const processBatch = async () => {
    if (status !== "POLLING") {
      return;
    }

    const { position, update } = await cursor.acquire();
    const events = eventStore.retrieveAll({
      idGt: position,
      limit: 1000,
    });
    const result = await callSubscribersSerial({
      subscribers,
      events,
    });

    if (result.outcome === "PROCESSED_BATCH") {
      await update(result.newPosition);
      // Immediately poll for the next batch in cases where we processed a batch, such that
      // if we are processing a long stream of events, we aren't held up by the interval.
      lastTimer = setTimeout(() => {
        lastInvocation = processBatch();
      }, 0);
    }

    if (result.outcome === "NO_EVENTS_PROCESSED") {
      await update(position);
      lastTimer = setTimeout(() => {
        lastInvocation = processBatch();
      }, pollIntervalMs);
    }
  };

  return {
    addSubscriber: subscribers.push.bind(subscribers),
    start: async () => {
      status = "POLLING";
      lastInvocation = processBatch();
    },
    halt: async () => {
      status = "HALTING";
      await lastInvocation;
      clearTimeout(lastTimer);
      status = "HALTED";
    },
  };
}

type CallSubscribersSerialOutcome =
  | { outcome: "NO_EVENTS_PROCESSED" }
  | { outcome: "PROCESSED_BATCH"; newPosition: bigint }
  | { outcome: "CRASHED_WITH_POSITION"; newPosition: bigint }
  | { outcome: "CRASHED_NO_EVENTS_PROCESSED"; newPosition: bigint };

async function callSubscribersSerial<TEvent extends Event = Event>(
  { events, subscribers }: {
    events: AsyncGenerator<PersistedEvent<TEvent>>;
    subscribers: Subscribers<TEvent>;
  },
): Promise<CallSubscribersSerialOutcome> {
  let newPosition = -1n;
  for await (const event of events) {
    await subscribers.reduce(async (acc, subscriber) => {
      await acc;
      await subscriber(event);
      newPosition = event.id;
    }, Promise.resolve());
  }
  return newPosition === -1n
    ? { outcome: "NO_EVENTS_PROCESSED" }
    : { outcome: "PROCESSED_BATCH", newPosition };
}
