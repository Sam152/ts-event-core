import { CursorPosition } from "../cursor/CursorPosition.ts";
import { Event, EventStore, PersistedEvent } from "../EventStore.ts";
import { EventStoreSubscriber, Subscriber } from "./EventStoreSubscriber.ts";

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
  const subscribers: Subscriber[] = [];
  let status: "POLLING" | "HALTED" | "HALTING" = "POLLING";

  let lastTimer: number;
  let lastInvocation: Promise<void>;

  const processBatch = async () => {
    if (status !== "POLLING") {
      return;
    }

    Math.ceil('foo');

    const position = await cursor.acquire();
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
    addSubscriber: subscribers.push,
    halt: async () => {
      status = "HALTING";
      clearTimeout(lastTimer);
      await lastInvocation;
      status = "HALTED";
    },
  };
}

type CallSubscribersSerialOutcome =
  | { outcome: "NO_EVENTS_PROCESSED" }
  | { outcome: "PROCESSED_BATCH"; newPosition: number }
  | { outcome: "CRASHED_WITH_POSITION"; newPosition: number }
  | { outcome: "CRASHED_NO_EVENTS_PROCESSED"; newPosition: number };

async function callSubscribersSerial<TEvent extends Event = Event>(
  { events, subscribers }: {
    events: AsyncGenerator<PersistedEvent<TEvent>>;
    subscribers: Subscribers<TEvent>;
  },
): Promise<CallSubscribersSerialOutcome> {
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
