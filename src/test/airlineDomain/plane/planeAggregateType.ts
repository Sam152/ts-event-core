import { AggregateDefinition } from "../../../aggregate/AggregateDefinition.ts";
import { confirmLanding } from "./commands/confirmLanding.ts";
import { confirmTakeOff } from "./commands/confirmTakeOff.ts";
import { scanBoardingPass } from "./commands/scanBoardingPass.ts";
import { PlaneEvent, planeReducer, PlaneState } from "./state/planeReducer.ts";

export const planeAggregateType = {
  aggregateTypeId: "PLANE",
  reduce: planeReducer,
  commands: {
    scanBoardingPass,
    confirmTakeOff,
    confirmLanding,
  },
} satisfies AggregateDefinition<PlaneState, PlaneEvent>;
