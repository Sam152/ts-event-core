import { FlightEvent } from "./FlightEvent.ts";
import { assertFlightScheduled, FlightState } from "./FlightState.ts";

export function flightReducer(state: FlightState, event: FlightEvent): FlightState {
  switch (event.type) {
    case "FLIGHT_SCHEDULED": {
      return {
        totalSeats: event.seatingCapacity,
        totalBoardedPassengers: 0,
        passengerManifest: {},
        status: "ON_THE_GROUND",
      };
    }
    case "FLIGHT_DEPARTED": {
      assertFlightScheduled(state);
      return {
        ...state,
        status: "IN_THE_AIR",
      };
    }
    case "FLIGHT_LANDED": {
      assertFlightScheduled(state);
      return {
        ...state,
        status: "ON_THE_GROUND",
      };
    }
    case "PASSENGER_BOARDED": {
      assertFlightScheduled(state);
      return {
        ...state,
        totalBoardedPassengers: state.totalBoardedPassengers + 1,
        passengerManifest: {
          ...state.passengerManifest,
          [event.passportNumber]: event.passengerName,
        },
      };
    }
    case "PASSENGER_DISEMBARKED": {
      assertFlightScheduled(state);
      const { [event.passportNumber]: _, ...remainingPassengers } = state.passengerManifest;
      return {
        ...state,
        totalBoardedPassengers: state.totalBoardedPassengers - 1,
        passengerManifest: remainingPassengers,
      };
    }
  }
}
