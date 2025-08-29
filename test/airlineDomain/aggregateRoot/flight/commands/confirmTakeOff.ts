import { assertPlaneInService, FlightState } from "../state/FlightState.ts";
import { FlightEvent } from "../state/FlightEvent.ts";

export function confirmTakeOff(
  flight: FlightState,
): FlightEvent {
  // Move to "withInServiceFlight" HOF, which returns failure event.
  assertPlaneInService(flight);

  if (flight.status === "IN_THE_AIR") {
    throw new Error("Plane has already confirmed as in the air.");
  }

  return {
    type: "FLIGHT_DEPARTED",
  };
}
