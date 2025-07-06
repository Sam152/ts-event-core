import { PlaneState } from "../state/PlaneState.ts";
import { PlaneEvent } from "../state/PlaneEvent.ts";

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
