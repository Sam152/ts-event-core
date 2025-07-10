import { gateAggregateRoot } from "./gate/gateAggregateRoot.ts";
import { flightAggregateRoot } from "./flight/flightAggregateRoot.ts";
import { EventsRaisedByAggregateRoots } from "../../../src/eventStore/EventStore.ts";

/**
 * Each aggregate root forms a logical grouping of events and commands in an event
 * sourced system. It is the meeting place of data and behavior, and everything inside the
 * boundary is considered to execute in a deterministic, predictable and sequential fashion.
 * This can also be referred to as a "consistency boundary".
 */
export const airlineAggregateRoots = {
  GATE: gateAggregateRoot,
  FLIGHT: flightAggregateRoot,
};

export type AirlineEvent = EventsRaisedByAggregateRoots<typeof airlineAggregateRoots>;
