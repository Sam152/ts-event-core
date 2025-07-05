import { EventStore } from "../EventStore.ts";

// @ts-expect-error - todo
export function createPostgresEventStore(): EventStore<unknown> {
}
