import { FlightState } from "../state/FlightState.ts";
import { FlightEvent } from "../state/FlightEvent.ts";

export function confirmLanding(_flight: FlightState): FlightEvent {
  return {
    type: "FLIGHT_LANDED",
  };
}
