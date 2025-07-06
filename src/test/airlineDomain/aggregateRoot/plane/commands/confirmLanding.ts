import { PlaneState } from "../state/PlaneState.ts";
import { PlaneEvent } from "../state/PlaneEvent.ts";

export function confirmLanding(_plane: PlaneState): PlaneEvent {
  return {
    type: "FLIGHT_ARRIVED",
  };
}
