import { AssertionError } from "@std/assert";

export type PlaneState = {
  status: "ON_THE_GROUND" | "IN_THE_AIR";
  totalSeats: number;
  totalBoardedPassengers: number;
  /**
   * A map of passport IDs to passenger names.
   */
  passengerManifest: Record<string, string>;
} | undefined;

/**
 * A lot of reducer cases will depend on a plane having "entered service", that is
 * having the data type of PlaneState, without the undefined case. That is, we only
 * hydrate all the properties of a plane once it enters service.
 *
 * For that reason, this assert can be used to narrow to the case of a plane having
 * entered service.
 */
export function assertPlaneInService(state: PlaneState): asserts state is Exclude<PlaneState, undefined> {
  if (typeof state === "undefined") {
    throw new AssertionError("Plane failed assertion of being in service.");
  }
}
