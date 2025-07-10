export type GateState = {
  status: "OPEN";
  planeDepartingAtGate: string;
} | {
  status: "CLOSED";
};
