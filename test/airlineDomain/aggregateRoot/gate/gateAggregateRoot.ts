import { AggregateRootDefinition } from "../../../../src/aggregate/AggregateRootDefinition.ts";
import { scanBoardingPass } from "./commands/scanBoardingPass.ts";
import { gateReducer } from "./state/gateReducer.ts";
import { GateState } from "./state/GateState.ts";
import { GateEvent } from "./state/GateEvent.ts";
import { openGate } from "./commands/openGate.ts";
import { closeGate } from "./commands/closeGate.ts";

export const gateAggregateRoot = {
  state: {
    reducer: gateReducer,
    version: 1,
    initialState: () => ({
      status: "CLOSED",
    }),
  },
  commands: {
    openGate,
    scanBoardingPass,
    closeGate,
  },
} satisfies AggregateRootDefinition<GateState, GateEvent>;
