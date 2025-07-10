import { GateState } from "../state/GateState.ts";
import { GateEvent } from "../state/GateEvent.ts";

export function openGate(
  gate: GateState,
  data: { openForFlight: string },
): GateEvent {
  if (gate.status === "OPEN") {
    return {
      type: "GATE_FAILED_TO_OPEN",
      reason: "GATE_ALREADY_OPEN",
    };
  }
  return {
    type: "GATE_OPENED",
    openedForPlane: data.openForFlight,
  };
}
