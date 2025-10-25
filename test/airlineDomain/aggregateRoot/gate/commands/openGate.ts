import {GateState} from "../state/GateState.ts";
import {GateEvent} from "../state/GateEvent.ts";

export function openGate(
  gate: GateState,
  data: { openForFlight: string },
): GateEvent {
  if (gate.status !== "CLOSED") {
    return {
      type: "OPEN_GATE_FAILED",
      reason: "GATE_ALREADY_OPEN",
    };
  }
  return {
    type: "GATE_OPENED",
    openedForPlane: data.openForFlight,
  };
}
