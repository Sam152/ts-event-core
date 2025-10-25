export type FlightEvent = {
  type: `${string}_FAILED`;
  reason: string;
} | {
  type: "PASSENGER_BOARDED" | "PASSENGER_DISEMBARKED";
  passengerName: string;
  passportNumber: string;
} | {
  type: "FLIGHT_DEPARTED" | "FLIGHT_LANDED";
} | {
  type: "FLIGHT_SCHEDULED";
  seatingCapacity: number;
};
