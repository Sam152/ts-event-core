import {
  createBasicCommandIssuer,
  createInMemoryEventStore,
  createInMemorySnapshotStorage,
  createMemoryCursorPosition,
  createMemoryReducedProjector,
  createPollingEventStoreSubscriber,
  createSnapshottingAggregateRootRepository,
} from "@ts-event-core/framework";
import { FlightTrackingDomainBootstrap } from "./FlightTrackingDomainBootstrap.ts";
import {
  airlineAggregateRoots,
  AirlineDomainEvent,
  flightDelayProcessManager,
  ticketProcessManager,
} from "@ts-event-core/airline-domain";

/**
 * Create an in-memory bootstrap of the flight tracking domain. Useful for things
 * like fast integration testing.
 */
export function bootstrapInMemory(): FlightTrackingDomainBootstrap {
  const eventStore = createInMemoryEventStore<AirlineDomainEvent>();

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

  const processManagers = createPollingEventStoreSubscriber({
    cursor: createMemoryCursorPosition(),
    eventStore,
  });
  processManagers.addSubscriber((event) => flightDelayProcessManager({ event, issueCommand }));
  processManagers.addSubscriber((event) => ticketProcessManager({ event, issueCommand }));

  return {
    issueCommand,
    readModels: {
      eventLog: eventLog,
      passengerActivity: passengerActivity,
    },
    start: async () => {
      await projections.start();
      await processManagers.start();
    },
    halt: async () => {
      await processManagers.halt();
      await projections.halt();
    },
  };
}
