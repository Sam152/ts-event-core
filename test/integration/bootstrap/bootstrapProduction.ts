import {
  createBasicCommandIssuer,
  createMemoryCursorPosition,
  createMemoryReducedProjector,
  createPollingEventStoreSubscriber,
  createSnapshottingAggregateRootRepository,
} from "@ts-event-core/framework";
import { testPostgresConnectionOptions } from "../utils/infra/testPostgresConnectionOptions.ts";
import { createPostgresEventStore } from "../../../src/eventStore/createPostgresEventStore.ts";
import postgres from "postgres";
import { createPostgresSnapshotStorage } from "@ts-event-core/framework";
import {
  airlineAggregateRoots,
  AirlineDomainEvent,
  flightDelayProcessManager,
  lifetimeEarningsReport,
  ticketProcessManager,
} from "@ts-event-core/airline-domain";
import { createPersistentLockingCursorPosition } from "@ts-event-core/framework";

/**
 * Create a production bootstrap of the flight tracking domain, which uses
 * persistent storage for key components.
 */
export function bootstrapProduction() {
  const connection = postgres(testPostgresConnectionOptions);

  const eventStore = createPostgresEventStore<AirlineDomainEvent>({ connection });

  const issueCommand = createBasicCommandIssuer({
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

  const projections = createPollingEventStoreSubscriber({
    cursor: createMemoryCursorPosition(),
    eventStore,
  });
  const lifetimeEarnings = createMemoryReducedProjector(lifetimeEarningsReport);
  projections.addSubscriber(lifetimeEarnings.projector);

  // Configure a process manager with a locking and persistent cursor. Under this configuration
  // only a single app container will run the process manager, and during boot-up side effects
  // will not be repeated.
  const processManagers = createPollingEventStoreSubscriber({
    cursor: createPersistentLockingCursorPosition({
      connection,
      id: "airlineProcessManagers",
    }),
    eventStore,
  });
  processManagers.addSubscriber((event) => flightDelayProcessManager({ event, issueCommand }));
  processManagers.addSubscriber((event) => ticketProcessManager({ event, issueCommand }));

  return {
    issueCommand,
    projections: {
      lifetimeEarnings,
    },
    start: async () => {
      await projections.start();
      await processManagers.start();
    },
    halt: async () => {
      await processManagers.halt();
      await projections.halt();
      await connection.end();
    },
  };
}
