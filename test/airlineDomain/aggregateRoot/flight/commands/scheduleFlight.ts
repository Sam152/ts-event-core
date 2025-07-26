import { FlightState } from "../state/FlightState.ts";
import { FlightEvent } from "../state/FlightEvent.ts";

export function scheduleFlight(
  flight: FlightState,
  { seatingCapacity }: {
    seatingCapacity: number;
  },
): FlightEvent {
  // Planes that have never been registered are represented in this aggregate root
  // as undefined.
  if (flight !== undefined) {
    throw new Error("Flight has already been scheduled.");
  }
  return {
    type: "NEW_FLIGHT_SCHEDULED",
    seatingCapacity,
  };
}
