import {AggregateDefinition} from "../../../../aggregate/AggregateDefinition.ts";
import {confirmLanding} from "./commands/confirmLanding.ts";
import {confirmTakeOff} from "./commands/confirmTakeOff.ts";
import {PlaneEvent, planeReducer, PlaneState} from "./state/planeReducer.ts";

export const planeAggregateType = {
  reducer: planeReducer,
  commands: {
    confirmTakeOff,
    confirmLanding,
  },
} satisfies AggregateDefinition<PlaneState, PlaneEvent>;
