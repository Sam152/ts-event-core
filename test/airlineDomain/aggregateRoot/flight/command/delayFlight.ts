import type { FlightEvent } from "../aggregateRoot.ts";
import { type ScheduledFlightState, withScheduledFlight } from "../util/withScheduledFlight.ts";

export const delayFlight = withScheduledFlight("DELAY_FLIGHT_FAILED", (
  flight: ScheduledFlightState,
  { delayedUntil }: { delayedUntil: Date },
): FlightEvent => {
  return {
    type: "FLIGHT_DELAYED",
    delayedUntil,
    impactedPassengerIds: flight.passengerManifest,
  };
});
