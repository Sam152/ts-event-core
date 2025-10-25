import { FlightState } from "../state/FlightState.ts";
import { FlightEvent } from "../state/FlightEvent.ts";

export function scheduleFlight(
  flight: FlightState,
  { seatingCapacity }: {
    seatingCapacity: number;
  },
): FlightEvent {
  const flightAlreadyScheduled = flight !== undefined;
  if (flightAlreadyScheduled) {
    return {
      type: "SCHEDULE_FLIGHT_FAILED",
      reason: "FLIGHT_ALREADY_SCHEDULED",
    };
  }

  return {
    type: "NEW_FLIGHT_SCHEDULED",
    seatingCapacity,
  };
}
