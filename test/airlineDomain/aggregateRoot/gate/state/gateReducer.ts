import { GateState } from "./GateState.ts";
import { GateEvent } from "./GateEvent.ts";

export function gateReducer(state: GateState, event: GateEvent): GateState {
  switch (event.type) {
    case "GATE_CLOSED":
      return {
        status: "CLOSED",
      };
    case "GATE_OPENED":
      return {
        status: "OPEN",
        planeDepartingAtGate: event.openedForPlane,
      };
    default:
      return state;
  }
}
