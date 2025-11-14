import {
  createBasicCommandIssuer,
  createInMemoryEventStore,
  createInMemorySnapshotStorage,
  createMemoryCursorPosition,
  createMemoryReducedProjector,
  createPollingEventStoreSubscriber,
  createSnapshottingAggregateRootRepository,
} from "@ts-event-core/framework";
import type { AirlineDomainBootstrap } from "./AirlineDomainBootstrap.ts";
import {
  airlineAggregateRoots,
  type AirlineDomainEvent,
  flightDelayProcessManager,
  lifetimeEarningsReport,
  notificationsReactor,
  ticketProcessManager,
} from "@ts-event-core/airline-domain";
import { createFakeMemoryNotifier } from "../../airlineDomain/reactor/createFakeMemoryNotifier.ts";

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

  const notificationOutboxSubscriber = createPollingEventStoreSubscriber({
    cursor: createMemoryCursorPosition(),
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
    },
  };
}
