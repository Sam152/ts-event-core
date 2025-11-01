import { CommandIssuer } from "@ts-event-core/framework";

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
export async function boardingProcessManager(
  { event, issueCommand }: {
    event: AirlineEvent;
    issueCommand: CommandIssuer<typeof airlineAggregateRoots>;
  },
) {
  if (event.payload.type === "BOARDING_PASS_SCANNED") {
    await issueCommand({
      aggregateRootType: "FLIGHT",
      command: "registerPassengerBoarded",
      aggregateRootId: event.payload.boardingPlane,
      data: {
        passengerName: event.payload.passengerName,
        passportNumber: event.payload.passportNumber,
      },
    });
  }
}
