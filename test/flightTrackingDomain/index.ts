export { airlineAggregateRoots, type AirlineEvent } from "./aggregateRoot/airlineAggregateRoots.ts";
export { boardingProcessManager } from "./processManager/boardingProcessManager.ts";
export { passengerActivityInitialState, passengerActivityReducer } from "./readModels/passengerActivity.ts";
export { eventLogInitialState, eventLogReducer } from "./readModels/eventLog.ts";

export type { EventLog } from "./readModels/eventLog.ts";
export type { PassengerActivity } from "./readModels/passengerActivity.ts";
