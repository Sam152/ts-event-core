import { PlaneEvent, PlaneState } from "../state/planeReducer.ts";

export function confirmLanding(plane: PlaneState): PlaneEvent {
  return {
    type: "FLIGHT_ARRIVED",
  };
}
