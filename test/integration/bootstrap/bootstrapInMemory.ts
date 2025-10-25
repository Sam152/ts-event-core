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
import { FlightTrackingDomainBootstrap } from "./FlightTrackingDomainBootstrap.ts";

/**
 * Create an in-memory bootstrap of the flight tracking domain. Useful for things
 * like fast integration testing.
 */
export function bootstrapInMemory(): FlightTrackingDomainBootstrap {
  const eventStore = createInMemoryEventStore<AirlineEvent>();
  const issueCommand = createBasicCommandIssuer({
    aggregateRoots: airlineAggregateRoots,
    aggregateRootRepository: createSnapshottingAggregateRootRepository({
      aggregateRoots: airlineAggregateRoots,
      eventStore,
      snapshotStorage: createInMemorySnapshotStorage(),
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

  const processManager = createPollingEventStoreSubscriber({
    cursor: createMemoryCursorPosition(),
    eventStore,
  });
  processManager.addSubscriber((event) => boardingProcessManager({ event, issueCommand }));

  return {
    issueCommand,
    readModels: {
      eventLog: eventLog.data,
      passengerActivity: passengerActivity.data,
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
