export type GateEvent = {
  type: "BOARDING_PASS_SCANNED";
  passengerName: string;
  passportNumber: string;
  boardingPlane: string;
} | {
  type: "GATE_OPENED";
  openedForPlane: string;
} | {
  type: "GATE_CLOSED";
} | {
  type: "GATE_FAILED_TO_OPEN";
  reason: string;
} | {
  type: "FAILED_TO_SCAN_BOARDING_PASS";
  reason: "GATE_NOT_OPEN";
};
