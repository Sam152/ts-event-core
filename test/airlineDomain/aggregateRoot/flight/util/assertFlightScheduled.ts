import { AssertionError } from "@std/assert";
import { FlightState, ScheduledFlightState } from "../aggregateRoot.ts";

/**
 * A lot of reducer cases may depend on a flight having been scheduled.
 */
export function assertFlightScheduled(state: FlightState): asserts state is ScheduledFlightState {
  if (state === undefined) {
    throw new AssertionError("Plane failed assertion of being in service.");
  }
}
