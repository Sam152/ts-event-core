import { GateEvent } from "../state/GateEvent.ts";

export function closeGate(): GateEvent {
  return {
    type: "GATE_CLOSED",
  };
}
