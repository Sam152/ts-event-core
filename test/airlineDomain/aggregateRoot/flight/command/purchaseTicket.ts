import { FlightEvent } from "../aggregateRoot.ts";
import { ScheduledFlightState, withScheduledFlight } from "../util/withScheduledFlight.ts";

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
