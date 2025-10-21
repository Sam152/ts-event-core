import { Event } from "../EventStore.ts";

export type Subscriber<TEvent extends Event> = (event: TEvent) => Promise<void> | void;

export type EventStoreSubscriber = {
  halt: () => Promise<void>;
  addSubscriber: (subscriber: Subscriber) => void;
};
