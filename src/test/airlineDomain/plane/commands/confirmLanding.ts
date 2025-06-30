import { PlaneEvent, PlaneState } from "../state/planeReducer.ts";

export function confirmLanding(plane: PlaneState): PlaneEvent {
  if (plane.status === "ON_THE_GROUND") {
    throw new Error("Plane has already confirmed as landed.");
  }
  return {
    type: "FLIGHT_ARRIVED",
  };
}
