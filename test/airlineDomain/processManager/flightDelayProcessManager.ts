import { CommandIssuer } from "@ts-event-core/framework";
import { airlineAggregateRoots, AirlineDomainEvent } from "../index.ts";

/**
 * A process manager which ensures that when a flight is delayed, each impacted
 * passenger is notified.
 */
export async function flightDelayProcessManager(
  { event, issueCommand }: {
    event: AirlineDomainEvent;
    issueCommand: CommandIssuer<typeof airlineAggregateRoots>;
  },
) {
  if (event.payload.type === "FLIGHT_DELAYED") {
    const delayedUntil = event.payload.delayedUntil;
    await Promise.all(event.payload.impactedPassengerIds.map(async (impactedPassenger) => {
      await issueCommand({
        aggregateRootType: "PASSENGER",
        command: "notifyOfFlightDelay",
        aggregateRootId: impactedPassenger,
        data: {
          flightNumber: event.aggregateRootId,
          delayedUntil,
        },
      });
    }));
  }
}
