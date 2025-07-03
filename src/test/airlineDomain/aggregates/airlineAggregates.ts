import { gateAggregateType } from "./gate/gateAggregateType.ts";
import { planeAggregateType } from "./plane/planeAggregateType.ts";
import { AggregateDefinitionMap } from "../../../aggregate/AggregateDefinition.ts";
import { PlaneEvent } from "./plane/state/planeReducer.ts";
import { GateEvent } from "./gate/state/gateReducer.ts";
import { Event } from "../../../eventStore/EventStore.ts";

export const airlineAggregates = {
  GATE: gateAggregateType,
  PLANE: planeAggregateType,
} satisfies AggregateDefinitionMap;

export type AirlineEvent = Event<PlaneEvent | GateEvent>;
