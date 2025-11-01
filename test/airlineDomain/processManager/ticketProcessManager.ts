import { CommandIssuer } from "@ts-event-core/framework";
import { aggregateRoots, AirlineDomainEvent } from "../index.ts";

/**
 * A process manager facilitates coordination between aggregates, this is an example of an orchestrated
 * workflow (as opposed to a choreographed one) since the process manager acts a central decision-making
 * hub for the domain, where commands issued in a process are a function of the events raised.
 *
 * Aggregates are always eventually consistent with respect to each-other, so a process manager needs to
 * account for downstream aggregates rejecting the issued command and raising unfavourable events, or
 * eventual consistency must be a tolerable feature of the domain.
 *
 * Where strong consistency is a hard requirement of a transaction within the domain, all events and
 * aggregates must be colocated within the same aggregate root.
 */
export async function ticketProcessManager(
  { event, issueCommand }: {
    event: AirlineDomainEvent;
    issueCommand: CommandIssuer<typeof aggregateRoots>;
  },
) {
  if (event.payload.type === "TICKET_PURCHASED") {
    await issueCommand({
      aggregateRootType: "PASSENGER",
      command: "addTicketToAccount",
      aggregateRootId: event.payload.passengerId,
      data: {
        flightNumber: event.aggregateRootId,
      },
    });
  }
}
