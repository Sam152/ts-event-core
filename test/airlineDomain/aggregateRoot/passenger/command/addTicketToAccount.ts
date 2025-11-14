import type { PassengerEvent, PassengerState } from "../aggregateRoot.ts";

export function addTicketToAccount(
  passenger: PassengerState,
  { flightNumber }: {
    flightNumber: string;
  },
): PassengerEvent {
  if (passenger.purchasedTickets.map((ticket) => ticket.flightNumber).includes(flightNumber)) {
    return {
      type: "ADD_TICKET_TO_ACCOUNT_FAILED",
      reason: "TICKET_ALREADY_IN_ACCOUNT",
    };
  }
  return {
    type: "TICKET_ADDED_TO_ACCOUNT",
    flightNumber: flightNumber,
  };
}
