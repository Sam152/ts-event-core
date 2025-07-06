import { assertPlaneInService, PlaneState } from "../state/PlaneState.ts";
import { PlaneEvent } from "../state/PlaneEvent.ts";

export function confirmTakeOff(
  plane: PlaneState,
): PlaneEvent {
  assertPlaneInService(plane);

  if (plane.status === "IN_THE_AIR") {
    throw new Error("Plane has already confirmed as in the air.");
  }

  return {
    type: "FLIGHT_DEPARTED",
  };
}
