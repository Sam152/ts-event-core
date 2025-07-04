import { gateAggregateRoot } from "./gate/gateAggregateRoot.ts";
import { planeAggregateRoot } from "./plane/planeAggregateRoot.ts";
import { PlaneEvent } from "./plane/state/planeReducer.ts";
import { GateEvent } from "./gate/state/gateReducer.ts";
import { Event } from "../../../eventStore/EventStore.ts";

export const airlineAggregateRoots = {
  GATE: gateAggregateRoot,
  PLANE: planeAggregateRoot,
};

export type AirlineEvent = Event<PlaneEvent | GateEvent>;
