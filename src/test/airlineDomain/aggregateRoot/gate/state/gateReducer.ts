export type GateState = {};

export type GateEvent = {
  type: "BOARDING_PASS_SCANNED";
  passengerName: string;
  passportNumber: string;
};

export function gateReducer(event: GateEvent, state: GateState): GateState {
  return {};
}
