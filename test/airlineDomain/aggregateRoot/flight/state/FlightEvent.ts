export type FlightEvent = {
  type: "PASSENGER_BOARDED" | "PASSENGER_DISEMBARKED";
  passengerName: string;
  passportNumber: string;
} | {
  type: "FLIGHT_DEPARTED" | "FLIGHT_LANDED";
} | {
  type: "NEW_FLIGHT_SCHEDULED";
  seatingCapacity: number;
} | {
  type: "CONFIRM_TAKEOFF_FAILED";
  REASON: "FLIGHT_ALREADY_IN_THE_AIR";
} | {
  type: "SCHEDULE_FLIGHT_FAILED";
  REASON: "FLIGHT_ALREADY_SCHEDULED";
} | {
  type: "COMMAND_FAILED";
  commandName: string;
  reason: "FLIGHT_NOT_YET_SCHEDULED";
};
