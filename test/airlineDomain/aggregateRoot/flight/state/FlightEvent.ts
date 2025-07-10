export type FlightEvent = {
  type: "PASSENGER_BOARDED" | "PASSENGER_DISEMBARKED";
  passengerName: string;
  passportNumber: string;
} | {
  type: "FLIGHT_DEPARTED" | "FLIGHT_ARRIVED";
} | {
  type: "NEW_FLIGHT_SCHEDULED";
  seatingCapacity: number;
};
