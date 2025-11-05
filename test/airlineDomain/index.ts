import { passengerAggregateRoot } from "./aggregateRoot/passenger/aggregateRoot.ts";
import { flightAggregateRoot } from "./aggregateRoot/flight/aggregateRoot.ts";
import { EventsRaisedByAggregateRoots } from "@ts-event-core/framework";

/**
 * A domain starts with a declaration of the aggregate roots. Each aggregate root has an identifier, in this
 * case FLIGHT and PASSENGER. This object represents a bundle of all the code contained within the domain and
 * is later consumed by components of the framework.
 */
export const airlineAggregateRoots = {
  FLIGHT: flightAggregateRoot,
  PASSENGER: passengerAggregateRoot,
};

export type AirlineDomainEvent = EventsRaisedByAggregateRoots<typeof airlineAggregateRoots>;
export type { LifetimeEarningsReport } from "./projection/lifetimeEarningsReport.ts";

export { ticketProcessManager } from "./processManager/ticketProcessManager.ts";
export { flightDelayProcessManager } from "./processManager/flightDelayProcessManager.ts";
export { notificationsReactor } from "./reactor/notificationsReactor.ts";
export { lifetimeEarningsReport } from "./projection/lifetimeEarningsReport.ts";
