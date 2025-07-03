import { PlaneEvent, PlaneState } from "../state/planeReducer.ts";

export function confirmPassengerBoarding(
  plane: PlaneState,
  data: { passengerName: string; passportNumber: string },
): PlaneEvent {
  return {
    type: "PASSENGER_BOARDED",
    passengerName: data.passengerName,
    passportNumber: data.passportNumber,
  };
}
