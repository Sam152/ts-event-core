import { createInMemorySnapshotStorage } from "../snapshot/createInMemorySnapshotStorage.ts";
import { createInMemoryEventStore } from "../../eventStore/createInMemoryEventStore.ts";
import type { EventsRaisedByAggregateRoots } from "../../eventStore/EventStore.ts";
import { createSnapshottingAggregateRootRepository } from "./createSnapshottingAggregateRootRepository.ts";
import { traceCalls } from "../../../test/integration/utils/traceCalls.ts";
import { describe, it } from "jsr:@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { airlineAggregateRoots } from "@ts-event-core/airline-domain";

describe("snapshotting aggregate root repository", () => {
  const { proxy: eventStore, calls: eventStoreCalls } = traceCalls(
    createInMemoryEventStore<EventsRaisedByAggregateRoots<typeof airlineAggregateRoots>>(),
  );
  const aggregateRootRepository = createSnapshottingAggregateRootRepository({
    eventStore: eventStore,
    aggregateRoots: airlineAggregateRoots,
    snapshotStorage: createInMemorySnapshotStorage(),
  });

  it("can avoid loading the full event stream", async () => {
    await aggregateRootRepository.persist({
      aggregateRoot: {
        aggregateRootId: "VA497",
        aggregateRootType: "FLIGHT",
        state: { status: "NOT_YET_SCHEDULED" },
      },
      pendingEventPayloads: [
        {
          type: "FLIGHT_SCHEDULED",
          sellableSeats: 100,
          departureTime: new Date(1000000),
        },
        {
          type: "TICKET_PURCHASED",
          passengerId: "PA-111110",
          purchasePrice: {
            currency: "AUD",
            cents: 100_00,
          },
        },
      ],
    });

    await eventStore.persist([
      {
        aggregateVersion: 3,
        aggregateRootId: "VA497",
        aggregateRootType: "FLIGHT",
        recordedAt: new Date(),
        payload: {
          type: "FLIGHT_DELAYED",
          delayedUntil: new Date(1001000),
          impactedPassengerIds: ["PA-111110"],
        },
      },
    ]);

    const aggregate = await aggregateRootRepository.retrieve({
      aggregateRootId: "VA497",
      aggregateRootType: "FLIGHT",
    });

    // The event store is only required to retrieve events from version 2 of the aggregate,
    // satisfying the rest of the requirements from the snapshot storage.
    assertEquals(eventStoreCalls[2], {
      name: "retrieve",
      args: [
        {
          aggregateRootId: "VA497",
          aggregateRootType: "FLIGHT",
          fromVersion: 2,
        },
      ],
    });

    assertEquals(aggregate.state, {
      status: "SCHEDULED",
      totalSeats: 100,
      totalAvailableSeats: 99,
      totalSeatsSold: 1,
      passengerManifest: ["PA-111110"],
    });
  });

  it("does not save a snapshot cases where there was an integrity violation", async () => {
    const repository = createSnapshottingAggregateRootRepository({
      eventStore,
      aggregateRoots: airlineAggregateRoots,
      snapshotStorage: createInMemorySnapshotStorage(),
    });

    // Persist initial flight and purchase one ticket
    await repository.persist({
      aggregateRoot: {
        aggregateRootId: "VA498",
        aggregateRootType: "FLIGHT",
        aggregateVersion: 1,
        state: {
          status: "SCHEDULED",
          totalSeats: 100,
          totalSeatsSold: 0,
          totalAvailableSeats: 100,
          passengerManifest: [],
        },
      },
      pendingEventPayloads: [
        {
          type: "TICKET_PURCHASED",
          passengerId: "PA-111111",
          purchasePrice: {
            currency: "AUD",
            cents: 100_00,
          },
        },
      ],
    });

    // Persisting a second time, with the same aggregate version will throw.
    let didThrow = false;
    try {
      await repository.persist({
        aggregateRoot: {
          aggregateRootId: "VA498",
          aggregateRootType: "FLIGHT",
          aggregateVersion: 1,
          state: {
            status: "SCHEDULED",
            totalSeats: 100,
            totalSeatsSold: 0,
            totalAvailableSeats: 100,
            passengerManifest: [],
          },
        },
        pendingEventPayloads: [
          {
            type: "TICKET_PURCHASED",
            passengerId: "PA-222222",
            purchasePrice: {
              currency: "AUD",
              cents: 100_00,
            },
          },
        ],
      });
    } catch (_e) {
      didThrow = true;
    }
    assertEquals(didThrow, true);

    // The state should be unaffected by the second, errored persist call.
    const aggregate = await repository.retrieve({
      aggregateRootId: "VA498",
      aggregateRootType: "FLIGHT",
    });
    assertEquals(aggregate.state, {
      status: "SCHEDULED",
      totalSeats: 100,
      totalSeatsSold: 1,
      totalAvailableSeats: 99,
      passengerManifest: ["PA-111111"],
    });
  });
});
