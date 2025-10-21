import { Event } from "../EventStore.ts";

export type Subscriber<TEvent extends Event> = (event: TEvent) => Promise<void> | void;

export type EventStoreSubscriber<TEvent extends Event> = {
  halt: () => Promise<void>;
  addSubscriber: (subscriber: Subscriber<TEvent>) => void;
};
