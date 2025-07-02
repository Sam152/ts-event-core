export type PlaneState = {
  status: "ON_THE_GROUND" | "IN_THE_AIR";
  totalSeats: number;
  totalBoardedPassengers: number;
  /**
   * A map of passport IDs to passenger names.
   */
  passengerManifest: Record<string, string>;
};

export type PlaneEvent = {
  type: "PASSENGER_BOARDED" | "PASSENGER_DISEMBARKED";
  passengerName: string;
  passportNumber: string;
} | {
  type: "FLIGHT_DEPARTED" | "FLIGHT_ARRIVED";
} | {
  type: "PLANE_ENTERED_SERVICE";
  seatingCapacity: number;
};

export function planeReducer(state: PlaneState, event: PlaneEvent): PlaneState {
  switch (event.type) {
    case "FLIGHT_DEPARTED": {
      return {
        ...state,
        status: "IN_THE_AIR",
      };
    }
    case "FLIGHT_ARRIVED": {
      return {
        ...state,
        status: "ON_THE_GROUND",
      };
    }
    case "PLANE_ENTERED_SERVICE": {
      return {
        totalSeats: event.seatingCapacity,
        totalBoardedPassengers: 0,
        passengerManifest: {},
        status: "ON_THE_GROUND",
      };
    }
    case "PASSENGER_BOARDED": {
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
      const { [event.passportNumber]: _, ...remainingPassengers } = state.passengerManifest;
      return {
        ...state,
        totalBoardedPassengers: state.totalBoardedPassengers - 1,
        passengerManifest: remainingPassengers,
      };
    }
  }
}
