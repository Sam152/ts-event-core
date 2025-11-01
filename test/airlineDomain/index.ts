import { passengerAggregateRoot } from "./aggregateRoot/passenger/aggregateRoot.ts";
import { flightAggregateRoot } from "./aggregateRoot/flight/aggregateRoot.ts";
import { EventsRaisedByAggregateRoots } from "@ts-event-core/framework";
export { boardingProcessManager } from "./subscriber/boardingProcessManager.ts";
export { passengerActivityInitialState, passengerActivityReducer } from "./projection/passengerActivity.ts";
export { eventLogInitialState, eventLogReducer } from "./projection/eventLog.ts";

export type { EventLog } from "./projection/eventLog.ts";
export type { PassengerActivity } from "./projection/passengerActivity.ts";

/**
 * Each aggregate root forms a logical grouping of events and commands in an event
 * sourced system. It is the meeting place of data and behavior, and everything inside the
 * boundary is considered to execute in a deterministic, predictable and sequential fashion.
 * This can also be referred to as a "consistency boundary".
 */
export const aggregateRoots = {
  PASSENGER: passengerAggregateRoot,
  FLIGHT: flightAggregateRoot,
};

export type AirlineDomainEvent = EventsRaisedByAggregateRoots<typeof aggregateRoots>;
