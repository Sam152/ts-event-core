import { EventStore } from "./EventStore.ts";

// @ts-expect-error - TODO
export function createPostgresEventStore(): EventStore<unknown> {
}
