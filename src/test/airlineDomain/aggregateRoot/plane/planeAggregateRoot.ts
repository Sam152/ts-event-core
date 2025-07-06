import { AggregateRootDefinition } from "../../../../aggregate/AggregateRootDefinition.ts";
import { confirmLanding } from "./commands/confirmLanding.ts";
import { confirmPassengerBoarding } from "./commands/confirmPassengerBoarding.ts";
import { confirmTakeOff } from "./commands/confirmTakeOff.ts";
import { PlaneState } from "./state/PlaneState.ts";
import { PlaneEvent } from "./state/PlaneEvent.ts";
import { planeReducer } from "./state/planeReducer.ts";

export const planeAggregateRoot = {
  state: {
    reducer: planeReducer,
    initialState: undefined,
  },
  commands: {
    confirmTakeOff,
    confirmLanding,
    confirmPassengerBoarding,
  },
} satisfies AggregateRootDefinition<PlaneState, PlaneEvent>;
