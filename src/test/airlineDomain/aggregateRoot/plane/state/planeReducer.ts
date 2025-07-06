import { PlaneEvent } from "./PlaneEvent.ts";
import { assertPlaneInService, PlaneState } from "./PlaneState.ts";

export function planeReducer(state: PlaneState, event: PlaneEvent): PlaneState {
  switch (event.type) {
    case "PLANE_ENTERED_SERVICE": {
      return {
        totalSeats: event.seatingCapacity,
        totalBoardedPassengers: 0,
        passengerManifest: {},
        status: "ON_THE_GROUND",
      };
    }
    case "FLIGHT_DEPARTED": {
      assertPlaneInService(state);
      return {
        ...state,
        status: "IN_THE_AIR",
      };
    }
    case "FLIGHT_ARRIVED": {
      assertPlaneInService(state);
      return {
        ...state,
        status: "ON_THE_GROUND",
      };
    }
    case "PASSENGER_BOARDED": {
      assertPlaneInService(state);
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
      assertPlaneInService(state);
      const { [event.passportNumber]: _, ...remainingPassengers } = state.passengerManifest;
      return {
        ...state,
        totalBoardedPassengers: state.totalBoardedPassengers - 1,
        passengerManifest: remainingPassengers,
      };
    }
  }
}
