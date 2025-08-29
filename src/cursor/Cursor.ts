import { Event } from "../eventStore/EventStore.ts";

export type Cursor<TEvent extends Event> = {
  subscribe: (name: string, subscriber: (event: TEvent) => void | Promise<void>) => void;
}

function createMemoryCursor() {

}

export function createPersistentLockingCursor() {

}
