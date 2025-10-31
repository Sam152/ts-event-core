import { AggregateRootDefinition } from "@ts-event-core/framework";
import { scanBoardingPass } from "./commands/scanBoardingPass.ts";
import { gateReducer } from "./state/gateReducer.ts";
import { GateState } from "./state/GateState.ts";
import { GateEvent } from "./state/GateEvent.ts";
import { openGate } from "./commands/openGate.ts";
import { closeGate } from "./commands/closeGate.ts";
import { eventLogInitialState } from "@ts-event-core/flight-tracking-domain";

export const gateAggregateRoot = {
  state: {
    version: 1,
    reducer: gateReducer,
    initialState: {
      status: "CLOSED",
    },
  },
  commands: {
    openGate,
    scanBoardingPass,
    closeGate,
  },
} satisfies AggregateRootDefinition<GateState, GateEvent>;
