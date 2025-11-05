import { FlightEvent, FlightState } from "./aggregateRoot.ts";
import { assertFlightScheduled } from "./util/assertFlightScheduled.ts";

/**
 * The state reducer is responsible for creating a useful decision model out of the events raised by the aggregate root.
 *
 * In this case we're keeping track of the total number of seats we're allowed to sell as tickets are purchased, such that
 * we don't oversell any flights.
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
