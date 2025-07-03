import { PlaneEvent, PlaneState } from "../state/planeReducer.ts";

export function confirmLanding(_plane: PlaneState): PlaneEvent {
  return {
    type: "FLIGHT_ARRIVED",
  };
}
