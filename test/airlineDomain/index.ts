import { passengerAggregateRoot } from "./aggregateRoot/passenger/aggregateRoot.ts";
import { flightAggregateRoot } from "./aggregateRoot/flight/aggregateRoot.ts";
import { EventsRaisedByAggregateRoots } from "@ts-event-core/framework";

/**
 * Each aggregate root forms a logical grouping of events and commands in an event
 * sourced system. It is the meeting place of data and behavior, and everything inside the
 * boundary is considered to execute in a deterministic, predictable and sequential fashion.
 * This can also be referred to as a "consistency boundary".
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
