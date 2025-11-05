import { FlightEvent, FlightState } from "./aggregateRoot.ts";
import { assertFlightScheduled } from "./util/assertFlightScheduled.ts";

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
