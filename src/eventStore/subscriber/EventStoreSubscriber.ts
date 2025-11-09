import { Event } from "../EventStore.ts";

export type Subscriber<TEvent extends Event> = (event: TEvent) => Promise<void> | void;

export type EventStoreSubscriber<TEvent extends Event> = {
  addSubscriber: (subscriber: Subscriber<TEvent>) => void;
  start: () => Promise<void>;
  halt: () => Promise<void>;
};
