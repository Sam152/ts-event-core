import { FlightState } from "../state/FlightState.ts";
import { FlightEvent } from "../state/FlightEvent.ts";

export function scheduleFlight(
  plane: FlightState,
  { seatingCapacity }: {
    seatingCapacity: number;
  },
): FlightEvent {
  // Planes that have never been registered are represented in this aggregate root
  // as undefined.
  if (plane !== undefined) {
    throw new Error("Plan was already registered for service.");
  }
  return {
    type: "NEW_FLIGHT_SCHEDULED",
    seatingCapacity,
  };
}
