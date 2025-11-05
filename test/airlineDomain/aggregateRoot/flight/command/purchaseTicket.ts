import { FlightEvent } from "../aggregateRoot.ts";
import { ScheduledFlightState, withScheduledFlight } from "../util/withScheduledFlight.ts";

/**
 * Commands are pure functions. They receive a state object and command data from the issuer. They return an event or
 * array of events, describing the outcome of the command.
 *
 * Since these are pure functions any functional programming techniques can be applied here. A lot of our commands require
 * that a flight has actually been scheduled, so the `withScheduledFlight` HOF takes care of this check for us, returning
 * a `TICKET_PURCHASED_FAILED` event on our behalf.
 */
export const purchaseTicket = withScheduledFlight("TICKET_PURCHASED_FAILED", (
  flight: ScheduledFlightState,
  { passengerId, purchasePriceAudCents }: {
    passengerId: string;
    purchasePriceAudCents: number;
  },
): FlightEvent => {
  if (flight.totalAvailableSeats === 0) {
    return {
      type: "TICKET_PURCHASED_FAILED",
      reason: "NO_AVAILABLE_SEATS",
    };
  }
  return {
    type: "TICKET_PURCHASED",
    passengerId: passengerId,
    purchasePrice: {
      currency: "AUD",
      cents: purchasePriceAudCents,
    },
  };
});
