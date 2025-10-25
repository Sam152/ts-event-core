export type GateEvent = {
  type: `${string}_FAILED`;
  reason: string;
} | {
  type: "BOARDING_PASS_SCANNED";
  passengerName: string;
  passportNumber: string;
  boardingPlane: string;
} | {
  type: "GATE_OPENED";
  openedForFlight: string;
} | {
  type: "GATE_CLOSED";
};
