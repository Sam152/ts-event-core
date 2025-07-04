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
  
}
