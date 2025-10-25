import {
  createBasicCommandIssuer,
  createInMemoryEventStore,
  createInMemorySnapshotStorage,
  createMemoryCursorPosition,
  createMemoryReducedProjector,
  createPollingEventStoreSubscriber,
  createSnapshottingAggregateRootRepository,
} from "@ts-event-core/framework";
import {
  airlineAggregateRoots,
  AirlineEvent,
  boardingProcessManager,
  eventLogInitialState,
  eventLogReducer,
  passengerActivityInitialState,
  passengerActivityReducer,
} from "@ts-event-core/flight-tracking-domain";
import { testPostgresConnectionOptions } from "../utils/infra/testPostgresConnectionOptions.ts";
import { createPostgresEventStore } from "../../../src/eventStore/createPostgresEventStore.ts";
import postgres from "postgres";
import { createPostgresSnapshotStorage } from "../../../src/aggregate/snapshot/createPostgresSnapshotStorage.ts";

/**
 * Create a production bootstrap of the flight tracking domain, which uses
 * persistent storage for key components.
 */
export function bootstrapProduction() {
  const connection = postgres(testPostgresConnectionOptions);

  const eventStore = createPostgresEventStore<AirlineEvent>({ connection });

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

  const passengerActivity = createMemoryReducedProjector({
    initialState: passengerActivityInitialState,
    reducer: passengerActivityReducer,
  });
  const eventLog = createMemoryReducedProjector({
    initialState: eventLogInitialState,
    reducer: eventLogReducer,
  });
  const projections = createPollingEventStoreSubscriber({
    cursor: createMemoryCursorPosition(),
    eventStore,
  });
  projections.addSubscriber(eventLog.projector);
  projections.addSubscriber(passengerActivity.projector);

  // Configure a process manager with a locking and persistent cursor. Under this configuration
  // only a single app container will run the process manager, and during boot-up side effects
  // will not be repeated.
  const processManager = createPollingEventStoreSubscriber({
    // @todo, this must be replaced with createPersistentLockingCursorPosition().
    cursor: createMemoryCursorPosition(),
    eventStore,
  });
  processManager.addSubscriber((event) => boardingProcessManager({ event, issueCommand }));

  return {
    issueCommand,
    readModels: {
      eventLog: eventLog,
      passengerActivity: passengerActivity,
    },
    start: async () => {
      await projections.start();
      await processManager.start();
    },
    halt: async () => {
      await processManager.halt();
      await projections.halt();
    },
  };
}
