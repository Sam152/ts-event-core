import { AggregateDefinition } from "../../../../aggregate/AggregateDefinition.ts";
import { scanBoardingPass } from "./commands/scanBoardingPass.ts";
import { GateEvent, gateReducer, GateState } from "./state/gateReducer.ts";

export const gateAggregateType = {
  reducer: gateReducer,
  commands: {
    scanBoardingPass,
  },
} satisfies AggregateDefinition<GateState, GateEvent>;
