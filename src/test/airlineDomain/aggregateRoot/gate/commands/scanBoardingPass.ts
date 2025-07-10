import { GateState } from "../state/GateState.ts";
import { GateEvent } from "../state/GateEvent.ts";

export function scanBoardingPass(
  gate: GateState,
  data: { passengerName: string; passportNumber: string },
): GateEvent {
  if (gate.status !== "OPEN") {
    return {
      type: "FAILED_TO_SCAN_BOARDING_PASS",
      reason: "GATE_NOT_OPEN",
    };
  }
  return {
    type: "BOARDING_PASS_SCANNED",
    boardingPlane: gate.planeDepartingAtGate,
    passengerName: data.passengerName,
    passportNumber: data.passportNumber,
  };
}
