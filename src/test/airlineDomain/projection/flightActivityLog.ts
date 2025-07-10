import { AirlineEvent } from "../aggregateRoot/airlineAggregateRoots.ts";

type FlightActivityLog = {
  passengers: {
    [key: string]: {
      flightsTaken: number;
    };
  };
  planes: {
    [key: string]: {
      tripsFlown: number;
    };
  };
};

export const flightActivityLogInitialState = {
  passengers: {},
  planes: {},
};

export function flightActivityLogReducer(state: FlightActivityLog, event: AirlineEvent): FlightActivityLog {
  switch (event.payload.type) {
    case "PASSENGER_BOARDED": {
      return {
        ...state,
        passengers: {
          ...state.passengers,
          [event.payload.passengerName]: {
            flightsTaken: (state.passengers[event.payload.passengerName]?.flightsTaken || 0) + 1,
          },
        },
      };
    }
    case "FLIGHT_DEPARTED": {
      return {
        ...state,
        planes: {
          ...state.planes,
          [event.aggregateRootId]: {
            tripsFlown: (state.planes[event.aggregateRootId]?.tripsFlown || 0) + 1,
          },
        },
      };
    }
    default:
      return state;
  }
}
