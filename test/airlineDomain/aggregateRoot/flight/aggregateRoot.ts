import { AggregateRootDefinition } from "@ts-event-core/framework";
import { flightReducer } from "./reducer.ts";
import { purchaseTicket } from "./command/purchaseTicket.ts";
import { scheduleFlight } from "./command/scheduleFlight.ts";
import { delayFlight } from "./command/delayFlight.ts";

export type FlightState =
  | {
    status: "SCHEDULED";
    totalSeats: number;
    totalSeatsSold: number;
    totalAvailableSeats: number;
    passengerManifest: string[];
  }
  | { status: "NOT_YET_SCHEDULED" };

export type FlightEvent = {
  type: "FLIGHT_SCHEDULING_FAILED" | "TICKET_PURCHASED_FAILED" | "DELAY_FLIGHT_FAILED";
  reason: string;
} | {
  type: "FLIGHT_SCHEDULED";
  sellableSeats: number;
  departureTime: Date;
} | {
  type: "TICKET_PURCHASED";
  passengerId: string;
  purchasePrice: {
    currency: "AUD";
    cents: number;
  };
} | {
  type: "FLIGHT_DELAYED";
  delayedUntil: Date;
  impactedPassengerIds: string[];
};

/**
 * Each aggregate root definition has a state and commands property.
 */
export const flightAggregateRoot = {
  state: {
    version: 1,
    initialState: { status: "NOT_YET_SCHEDULED" },
    reducer: flightReducer,
  },
  commands: {
    scheduleFlight,
    purchaseTicket,
    delayFlight,
  },
} satisfies AggregateRootDefinition<FlightState, FlightEvent>;
