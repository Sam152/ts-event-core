export type GateState = {};

export type GateEvent = {
  type: "BOARDING_PASS_SCANNED";
  passengerName: string;
  passportNumber: string;
};

export function gateReducer(state: GateState, event: GateEvent): GateState {
  return {};
}
