import { AssertionError } from "@std/assert";
import type { FlightState } from "../aggregateRoot.ts";

/**
 * A lot of reducer cases may depend on a flight having been scheduled.
 */
export function assertFlightScheduled(
  state: FlightState,
): asserts state is Extract<FlightState, { status: "SCHEDULED" }> {
  if (state.status !== "SCHEDULED") {
    throw new AssertionError("Flight not yet scheduled.");
  }
}
