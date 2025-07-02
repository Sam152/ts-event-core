import { GateEvent, GateState } from "../state/gateReducer.ts";

export function scanBoardingPass(
  gate: GateState,
  data: { passengerName: string; passportNumber: string },
): GateEvent {
  return {
    type: "BOARDING_PASS_SCANNED",
    passengerName: data.passengerName,
    passportNumber: data.passportNumber,
  };
}
