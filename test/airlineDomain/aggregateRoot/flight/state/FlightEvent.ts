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
  type: `${string}_FAILED`;
  reason: string;
};
