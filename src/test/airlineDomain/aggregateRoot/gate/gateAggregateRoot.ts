import { AggregateRootDefinition } from "../../../../aggregate/AggregateRootDefinition.ts";
import { scanBoardingPass } from "./commands/scanBoardingPass.ts";
import { GateEvent, gateReducer, GateState } from "./state/gateReducer.ts";

export const gateAggregateRoot = {
  reducer: gateReducer,
  commands: {
    scanBoardingPass,
  },
} satisfies AggregateRootDefinition<GateState, GateEvent>;
