import { gateAggregateType } from "./gate/gateAggregateType.ts";
import { planeAggregateType } from "./plane/planeAggregateType.ts";
import { AggregateDefinitionMap } from "../../../aggregate/AggregateDefinition.ts";

export const airlineAggregates = {
  GATE: gateAggregateType,
  PLANE: planeAggregateType,
} satisfies AggregateDefinitionMap;
