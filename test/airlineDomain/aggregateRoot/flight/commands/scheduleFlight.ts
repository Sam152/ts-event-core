import { FlightState } from "../state/FlightState.ts";
import { FlightEvent } from "../state/FlightEvent.ts";

export function scheduleFlight(
  flight: FlightState,
  { seatingCapacity }: {
    seatingCapacity: number;
  },
): FlightEvent {
  if (flight !== undefined) {
    return {
      type: "SCHEDULE_FLIGHT_FAILED",
      REASON: "FLIGHT_ALREADY_SCHEDULED",
    };
  }
  return {
    type: "NEW_FLIGHT_SCHEDULED",
    seatingCapacity,
  };
}
