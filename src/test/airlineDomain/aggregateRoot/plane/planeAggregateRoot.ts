import { AggregateRootDefinition } from "../../../../aggregate/AggregateRootDefinition.ts";
import { confirmLanding } from "./commands/confirmLanding.ts";
import { confirmPassengerBoarding } from "./commands/confirmPassengerBoarding.ts";
import { confirmTakeOff } from "./commands/confirmTakeOff.ts";
import { PlaneEvent, planeReducer, PlaneState } from "./state/planeReducer.ts";

export const planeAggregateRoot = {
  reducer: planeReducer,
  commands: {
    confirmTakeOff,
    confirmLanding,
    confirmPassengerBoarding,
  },
} satisfies AggregateRootDefinition<PlaneState, PlaneEvent>;
