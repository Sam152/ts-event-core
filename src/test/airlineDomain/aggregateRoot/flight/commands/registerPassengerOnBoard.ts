import { assertPlaneInService, FlightState } from "../state/FlightState.ts";
import { FlightEvent } from "../state/FlightEvent.ts";

export function registerPassengerOnBoard(
  plane: FlightState,
  data: { passengerName: string; passportNumber: string },
): FlightEvent {
  assertPlaneInService(plane);
  return {
    type: "PASSENGER_BOARDED",
    passengerName: data.passengerName,
    passportNumber: data.passportNumber,
  };
}
