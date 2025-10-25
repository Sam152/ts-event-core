import { AggregateRootDefinition } from "../../../../src/aggregate/AggregateRootDefinition.ts";
import { confirmLanding } from "./commands/confirmLanding.ts";
import { registerPassengerBoarded } from "./commands/registerPassengerBoarded.ts";
import { confirmTakeoff } from "./commands/confirmTakeoff.ts";
import { FlightState } from "./state/FlightState.ts";
import { FlightEvent } from "./state/FlightEvent.ts";
import { flightReducer } from "./state/flightReducer.ts";
import { scheduleFlight } from "./commands/scheduleFlight.ts";

export const flightAggregateRoot = {
  state: {
    version: 1,
    initialState: undefined,
    reducer: flightReducer,
  },
  commands: {
    scheduleFlight,
    registerPassengerOnBoard: registerPassengerBoarded,
    confirmTakeOff: confirmTakeoff,
    confirmLanding,
  },
} satisfies AggregateRootDefinition<FlightState, FlightEvent>;
