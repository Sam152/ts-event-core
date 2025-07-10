import { AggregateRootDefinition } from "../../../../src/aggregate/AggregateRootDefinition.ts";
import { confirmLanding } from "./commands/confirmLanding.ts";
import { registerPassengerOnBoard } from "./commands/registerPassengerOnBoard.ts";
import { confirmTakeOff } from "./commands/confirmTakeOff.ts";
import { FlightState } from "./state/FlightState.ts";
import { FlightEvent } from "./state/FlightEvent.ts";
import { flightReducer } from "./state/flightReducer.ts";
import { scheduleFlight } from "./commands/scheduleFlight.ts";

export const flightAggregateRoot = {
  state: {
    reducer: flightReducer,
    initialState: undefined,
  },
  commands: {
    scheduleFlight,
    registerPassengerOnBoard,
    confirmTakeOff,
    confirmLanding,
  },
} satisfies AggregateRootDefinition<FlightState, FlightEvent>;
