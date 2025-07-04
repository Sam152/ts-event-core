import { AirlineEvent } from "../aggregateRoots/airlineAggregateRoots.ts";

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

export function flightActivityLog(state: FlightActivityLog, event: AirlineEvent): FlightActivityLog {
  switch (event.payload.type) {
    case "PASSENGER_BOARDED": {
      const passengerKey = `${event.payload.passengerName}:${event.payload.passportNumber}`;
      return {
        ...state,
        passengers: {
          ...state.passengers,
          [passengerKey]: {
            flightsTaken: (state.passengers[passengerKey]?.flightsTaken || 0) + 1,
          },
        },
      };
    }
    case "FLIGHT_DEPARTED": {
      return {
        ...state,
        planes: {
          ...state.planes,
          [event.aggregateId]: {
            tripsFlown: (state.planes[event.aggregateId]?.tripsFlown || 0) + 1,
          },
        },
      };
    }
    default:
      return state;
  }
}
