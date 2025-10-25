import {GateEvent} from "../state/GateEvent.ts";
import {GateState} from "../state/GateState.ts";

export function closeGate(gate: GateState): GateEvent {
  if (gate.status !== "OPEN") {
    return {
      type: "OPEN_GATE_FAILED",
      reason: "GATE_ALREADY_OPEN",
    };
  }
  return {
    type: "GATE_CLOSED",
  };
}
