import { PlaneEvent, PlaneState } from "../state/planeReducer.ts";

export function confirmTakeOff(
  plane: PlaneState,
): PlaneEvent {
  if (plane.status === "IN_THE_AIR") {
    throw new Error("Plane has already confirmed as in the air.");
  }
  return {
    type: "FLIGHT_DEPARTED",
  };
}
