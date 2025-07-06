import { PlaneState } from "../state/PlaneState.ts";
import { PlaneEvent } from "../state/PlaneEvent.ts";

export function registerNewPlaneReadyForService(
  plane: PlaneState,
  { seatingCapacity }: {
    seatingCapacity: number;
  },
): PlaneEvent {
  // Planes that have never been registered are represented in this aggregate root
  // as undefined.
  if (plane !== undefined) {
    throw new Error("Plan was already registered for service.");
  }
  return {
    type: "PLANE_ENTERED_SERVICE",
    seatingCapacity,
  };
}
