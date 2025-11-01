import { FlightEvent, FlightState } from "./aggregateRoot.ts";

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
  }

  return state;
}
