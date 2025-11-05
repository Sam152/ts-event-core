import { passengerAggregateRoot } from "./aggregateRoot/passenger/aggregateRoot.ts";
import { flightAggregateRoot } from "./aggregateRoot/flight/aggregateRoot.ts";
import { EventsRaisedByAggregateRoots } from "@ts-event-core/framework";

/**
 * For any given domain, a map between an aggregate root type and an aggregate root definition is created.
 * This object becomes a key declaration that is passed into other framework components.
 */
export const airlineAggregateRoots = {
  FLIGHT: flightAggregateRoot,
  PASSENGER: passengerAggregateRoot,
};

export type AirlineDomainEvent = EventsRaisedByAggregateRoots<typeof airlineAggregateRoots>;
export type { LifetimeEarningsReport } from "./projection/lifetimeEarningsReport.ts";

export { ticketProcessManager } from "./processManager/ticketProcessManager.ts";
export { flightDelayProcessManager } from "./processManager/flightDelayProcessManager.ts";
export { notificationOutbox } from "./integration/notificationOutbox.ts";
export { lifetimeEarningsReport } from "./projection/lifetimeEarningsReport.ts";
