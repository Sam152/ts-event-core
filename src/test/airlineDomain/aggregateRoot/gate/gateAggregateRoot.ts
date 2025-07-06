import { AggregateRootDefinition } from "../../../../aggregate/AggregateRootDefinition.ts";
import { scanBoardingPass } from "./commands/scanBoardingPass.ts";
import { GateEvent, gateReducer, GateState } from "./state/gateReducer.ts";

export const gateAggregateRoot = {
  state: {
    reducer: gateReducer,
    initialState: {},
  },
  commands: {
    scanBoardingPass,
  },
} satisfies AggregateRootDefinition<GateState, GateEvent>;
