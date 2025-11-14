import type { FlightEvent, FlightState } from "./aggregateRoot.ts";
import { assertFlightScheduled } from "./util/assertFlightScheduled.ts";

/**
 * The main component of state, a reducer, is responsible for creating a useful decision model out of the events raised.
 * A reducer will only ever process a single stream of events from a specific aggregate root (or a specific flight in our
 * case).
 *
 * In this case we're keeping track of the total number of seats we're allowed to sell as tickets are purchased, so that
 * we don't accidentally overbook a flight.
 */
export function flightReducer(state: FlightState, event: FlightEvent): FlightState {
  switch (event.type) {
    case "FLIGHT_SCHEDULED": {
      return {
        status: "SCHEDULED",
        totalSeats: event.sellableSeats,
        totalAvailableSeats: event.sellableSeats,
        totalSeatsSold: 0,
        passengerManifest: [],
      };
    }
    case "TICKET_PURCHASED": {
      assertFlightScheduled(state);
      return {
        ...state,
        totalSeatsSold: state.totalSeatsSold + 1,
        totalAvailableSeats: state.totalAvailableSeats - 1,
        passengerManifest: [...state.passengerManifest, event.passengerId],
      };
    }
  }
  return state;
}
