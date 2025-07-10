import { AirlineEvent } from "../aggregateRoot/airlineAggregateRoots.ts";

type EventLog = string[];

export const eventLogInitialState = [];

export function eventLogReducer(
  state: EventLog,
  event: AirlineEvent,
): EventLog {
  return [
    ...state,
    `${event.aggregateRootType}: ${event.payload.type}`,
  ];
}
