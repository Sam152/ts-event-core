import {
  createMemoryCursorPosition,
  createMemoryReducedProjector,
  createPollingEventStoreSubscriber,
  createSnapshottingAggregateRootRepository,
} from "@ts-event-core/framework";
import { createTestConnection } from "../utils/infra/testPostgresConnectionOptions.ts";
import { createPostgresEventStore } from "../../../src/eventStore/createPostgresEventStore.ts";
import { createPostgresSnapshotStorage } from "@ts-event-core/framework";
import {
  airlineAggregateRoots,
  type AirlineDomainEvent,
  flightDelayProcessManager,
  lifetimeEarningsReport,
  notificationsReactor,
  ticketProcessManager,
} from "@ts-event-core/airline-domain";
import { createPersistentLockingCursorPosition } from "@ts-event-core/framework";
import { createFakeMemoryNotifier } from "../../airlineDomain/reactor/createFakeMemoryNotifier.ts";
import type { AirlineDomainBootstrap } from "./AirlineDomainBootstrap.ts";
import { createQueuedCommandIssuer } from "../../../src/command/queued/createQueuedCommandIssuer.ts";

/**
 * Create a production bootstrap of the flight tracking domain.
 */
export function bootstrapProduction(): AirlineDomainBootstrap {
  const connection = createTestConnection();

  // Create an event store and command issuer.
  const eventStore = createPostgresEventStore<AirlineDomainEvent>({ connection });
  const { issueCommand } = createQueuedCommandIssuer({
    connection,
    aggregateRoots: airlineAggregateRoots,
    aggregateRootRepository: createSnapshottingAggregateRootRepository({
      aggregateRoots: airlineAggregateRoots,
      eventStore,
      // In theory, an in-memory snapshot storage could also be a suitable configuration for
      // production, where each time a container started, aggregates would "warm up" with a
      // full event replay, but then load faster on subsequent commands.
      snapshotStorage: createPostgresSnapshotStorage({ connection }),
    }),
  });

  // Initialize a projection. In production this could be persistent, but depending
  // on the size of the event stream, it may be acceptable for a replay each time a
  // container starts.
  const projections = createPollingEventStoreSubscriber({
    cursor: createMemoryCursorPosition(),
    eventStore,
  });
  const lifetimeEarnings = createMemoryReducedProjector(lifetimeEarningsReport);
  projections.addSubscriber(lifetimeEarnings.projector);

  // Configure a process manager with a locking and persistent cursor. Under this configuration
  // events will be processed exactly once, across all present and future containers.
  const processManagers = createPollingEventStoreSubscriber({
    cursor: createPersistentLockingCursorPosition({
      connection,
      id: "airlineProcessManagers",
    }),
    eventStore,
  });
  processManagers.addSubscriber((event) => flightDelayProcessManager({ event, issueCommand }));
  processManagers.addSubscriber((event) => ticketProcessManager({ event, issueCommand }));

  // Wire up an event subscriber as an outbox, ensuring to use a persistent cursor, such that
  // notifications aren't sent every time a container starts.
  const notificationOutboxSubscriber = createPollingEventStoreSubscriber({
    cursor: createPersistentLockingCursorPosition({
      connection,
      id: "notificationOutbox",
    }),
    eventStore,
  });
  const notifierFake = createFakeMemoryNotifier();
  notificationOutboxSubscriber.addSubscriber((event) =>
    notificationsReactor({
      notifier: notifierFake.notifier,
      event,
    })
  );

  return {
    issueCommand,
    notificationLog: notifierFake.log,
    projections: {
      lifetimeEarnings,
    },
    start: async () => {
      await projections.start();
      await notificationOutboxSubscriber.start();
      await processManagers.start();
    },
    halt: async () => {
      await processManagers.halt();
      await notificationOutboxSubscriber.halt();
      await projections.halt();
      await connection.end();
    },
  };
}
