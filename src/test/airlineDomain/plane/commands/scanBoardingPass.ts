import { PlaneEvent, PlaneState } from "../state/planeReducer.ts";

export function scanBoardingPass(
  plane: PlaneState,
  data: { passengerName: string; passportNumber: string },
): PlaneEvent {
  if (plane.totalBoardedPassengers >= plane.totalSeats) {
    throw new Error("Passenger cannot board plane, plane is full!");
  }
  return {
    type: "PASSENGER_BOARDED",
    passengerName: data.passengerName,
    passportNumber: data.passportNumber,
  };
}
