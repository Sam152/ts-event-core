import {
  createBasicCommandIssuer,
  createInMemoryEventStore,
  createInMemorySnapshotStorage,
  createMemoryCursorPosition,
  createMemoryReducedProjector,
  createPollingEventStoreSubscriber,
  createSnapshottingAggregateRootRepository,
} from "@ts-event-core/framework";
import { AirlineDomainBootstrap } from "./AirlineDomainBootstrap.ts";
import {
  airlineAggregateRoots,
  AirlineDomainEvent,
  flightDelayProcessManager,
  lifetimeEarningsReport,
  ticketProcessManager,
} from "@ts-event-core/airline-domain";

/**
 * Create an in-memory bootstrap of the flight tracking domain. Useful for things
 * like fast integration testing.
 */
export function bootstrapInMemory(): AirlineDomainBootstrap {
  const eventStore = createInMemoryEventStore<AirlineDomainEvent>();

  const issueCommand = createBasicCommandIssuer({
    aggregateRoots: airlineAggregateRoots,
    aggregateRootRepository: createSnapshottingAggregateRootRepository({
      aggregateRoots: airlineAggregateRoots,
      eventStore,
      snapshotStorage: createInMemorySnapshotStorage(),
    }),
  });

  const projections = createPollingEventStoreSubscriber({
    cursor: createMemoryCursorPosition(),
    eventStore,
  });

  const lifetimeEarnings = createMemoryReducedProjector(lifetimeEarningsReport);
  projections.addSubscriber(lifetimeEarnings.projector);

  const processManagers = createPollingEventStoreSubscriber({
    cursor: createMemoryCursorPosition(),
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
    },
  };
}
