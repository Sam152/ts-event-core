import { AggregateDefinition } from "../../../aggregate/AggregateDefinition.ts";

export const planeAggregateType: AggregateDefinition<PlaneState, PlaneEvent> = {
  aggregateTypeId: "PLANE",
  reduce: planeReducer,
  commands: {
    scanBoardingPass,
    confirmTakeOff,
    confirmLanding,
  },
};

function scanBoardingPass(
  plane: PlaneState,
  data: { passengerName: string; passportNumber: string },
): PlaneEvent {
  if (plane.totalBoardedPassengers >= plane.totalSeats) {
    throw new Error("Passenger cannot board plane, plane is full!");
  }
  return {
    type: "PASSENGER_BOARDED",
    passengerName: data.passengerName,
    passportNumber: data.passportNumber,
  };
}

function confirmTakeOff(
  plane: PlaneState,
): PlaneEvent {
  if (plane.status === "IN_THE_AIR") {
    throw new Error("Plane has already confirmed as in the air.");
  }
  return {
    type: "FLIGHT_DEPARTED",
  };
}

function confirmLanding(plane: PlaneState): PlaneEvent {
  if (plane.status === "ON_THE_GROUND") {
    throw new Error("Plane has already confirmed as landed.");
  }
  return {
    type: "FLIGHT_ARRIVED",
  };
}

type PlaneState = {
  status: "ON_THE_GROUND" | "IN_THE_AIR";
  totalSeats: number;
  totalBoardedPassengers: number;
  /**
   * A map of passport IDs to passenger names.
   */
  passengerManifest: Record<string, string>;
};

type PlaneEvent = {
  type: "PASSENGER_BOARDED" | "PASSENGER_DISEMBARKED";
  passengerName: string;
  passportNumber: string;
} | {
  type: "FLIGHT_DEPARTED" | "FLIGHT_ARRIVED";
} | {
  type: "PLANE_ENTERED_SERVICE";
  seatingCapacity: number;
};

function planeReducer(state: PlaneState, event: PlaneEvent): PlaneState {
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
