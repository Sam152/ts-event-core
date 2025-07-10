import { AirlineEvent } from "../aggregateRoot/airlineAggregateRoots.ts";

type PassengerActivityLog = {
  [key: string]: {
    flightsTaken: number;
  };
};

export const passengerActivityLogInitialState = {};

export function flightActivityLogReducer(
  state: PassengerActivityLog,
  event: AirlineEvent,
): PassengerActivityLog {
  switch (event.payload.type) {
    case "PASSENGER_BOARDED": {
      return {
        ...state,
        [event.payload.passengerName]: {
          flightsTaken: (state[event.payload.passengerName]?.flightsTaken || 0) + 1,
        },
      };
    }
    default:
      return state;
  }
}
