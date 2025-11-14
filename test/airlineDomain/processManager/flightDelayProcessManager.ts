import type { CommandIssuer } from "@ts-event-core/framework";
import type { airlineAggregateRoots, AirlineDomainEvent } from "../index.ts";

/**
 * A process manager facilitates coordination between aggregates. In this case, when a `FLIGHT_DELAYED` event is raised,
 * we must issue a command for each of the impacted passengers, to notify them of the delay.
 *
 * Command processing within a single aggregate is considered strongly consistent, data passed into each command is guaranteed to
 * be up-to-date and the outcome of a command will never be committed if it conflicts with any commands running in parallel
 * for the same aggregate.
 *
 * The same does not apply between aggregates. If a flight is delayed the moment a ticket is purchased, the passenger may
 * or may not be notified of the delay. Passengers are notified of delays at some point in the future, after a delay has been
 * recorded. These tradeoffs are acceptable in our sample domain.
 *
 * Features which require strong consistency (such as not overbooking a flight) must be validated within a single aggregate
 * root. If consistency issues are a headache in a given domain, it may be a sign that aggregate roots need to be less granular.
 * The granularity of aggregates generally trade-off parallelism and throughput with consistency. In this case, passengers
 * updating their notification preferences can happen in parallel to flight scheduling and ticket purchasing.
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
