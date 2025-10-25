import { AssertionError } from "@std/assert";

/**
 * State of a flight only after it has been scheduled.
 */
export type ScheduledFlightState = {
  status: "ON_THE_GROUND" | "IN_THE_AIR";
  totalSeats: number;
  totalBoardedPassengers: number;
  /**
   * A map of passport IDs to passenger names.
   */
  passengerManifest: Record<string, string>;
};

export type FlightState =
  | ScheduledFlightState
  | /**
   * An undefined flight state represents the state of a flight before
   * it has been scheduled. It is an equally valid representation of a flight
   */ undefined;

/**
 * A lot of reducer cases will depend on a plane having "entered service", that is
 * having the data type of PlaneState, without the undefined case. That is, we only
 * hydrate all the properties of a plane once it enters service.
 *
 * For that reason, this assert can be used to narrow to the case of a plane having
 * entered service.
 */
export function assertPlaneInService(state: FlightState): asserts state is Exclude<FlightState, undefined> {
  if (typeof state === "undefined") {
    throw new AssertionError("Plane failed assertion of being in service.");
  }
}
