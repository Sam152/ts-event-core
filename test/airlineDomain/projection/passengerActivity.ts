import { AirlineEvent } from "../aggregateRoot/airlineAggregateRoots.ts";

export type PassengerActivity = {
  [key: string]: {
    flightsTaken: number;
  };
};

export const passengerActivityInitialState = {};

export function passengerActivityReducer(
  state: PassengerActivity,
  event: AirlineEvent,
): PassengerActivity {
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
