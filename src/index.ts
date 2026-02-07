/**
 * This module contains the ts-event-core framework.
 * @module
 */

/**
 * Exported types.
 */

export type { AggregateRootDefinition } from "./aggregate/AggregateRootDefinition.ts";
export type { EventsRaisedByAggregateRoots } from "./eventStore/EventStore.ts";
export type { CommandIssuer } from "./command/CommandIssuer.ts";
export type { Event } from "./eventStore/EventStore.ts";
export type { QueuedCommandIssuer } from "./command/queued/createQueuedCommandIssuer.ts";

/**
 * Exported functions.
 */
export { createMemoryCursorPosition } from "./eventStore/cursor/createMemoryCursorPosition.ts";
export { createPollingEventStoreSubscriber } from "./eventStore/subscriber/createPollingEventStoreSubscriber.ts";
export { createInMemorySnapshotStorage } from "./aggregate/snapshot/createInMemorySnapshotStorage.ts";
export { createPostgresSnapshotStorage } from "./aggregate/snapshot/createPostgresSnapshotStorage.ts";
export {
  createSnapshottingAggregateRootRepository,
} from "./aggregate/repository/createSnapshottingAggregateRootRepository.ts";
export { createBasicCommandIssuer } from "./command/createBasicCommandIssuer.ts";
export { createInMemoryEventStore } from "./eventStore/createInMemoryEventStore.ts";
export { createMemoryReducedProjector } from "./projection/createMemoryReducedProjector.ts";
export { createBasicAggregateRootRepository } from "./aggregate/repository/createBasicAggregateRootRepository.ts";
export { createPersistentLockingCursorPosition } from "./eventStore/cursor/createPersistentLockingCursorPosition.ts";
export { createQueuedCommandIssuer } from "./command/queued/createQueuedCommandIssuer.ts";
