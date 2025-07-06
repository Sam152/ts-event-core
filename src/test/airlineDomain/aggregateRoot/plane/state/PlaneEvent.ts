export type PlaneEvent = {
  type: "PASSENGER_BOARDED" | "PASSENGER_DISEMBARKED";
  passengerName: string;
  passportNumber: string;
} | {
  type: "FLIGHT_DEPARTED" | "FLIGHT_ARRIVED";
} | {
  type: "PLANE_ENTERED_SERVICE";
  seatingCapacity: number;
};
