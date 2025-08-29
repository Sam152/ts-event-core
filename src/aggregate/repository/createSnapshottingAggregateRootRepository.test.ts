import { airlineAggregateRoots } from "../../../test/airlineDomain/aggregateRoot/airlineAggregateRoots.ts";
import { createMemorySnapshotStorage } from "../snapshot/createMemorySnapshotStorage.ts";
import { createMemoryEventStore } from "../../eventStore/createMemoryEventStore.ts";
import { EventsRaisedByAggregateRoots } from "../../eventStore/EventStore.ts";
import { createSnapshottingAggregateRootRepository } from "./createSnapshottingAggregateRootRepository.ts";
import { traceCalls } from "../../../test/utils/traceCalls.ts";
import { describe, it } from "jsr:@std/testing/bdd";
import { assertEquals } from "@std/assert";

describe("snapshotting aggregate root repository", () => {
  const { proxy: eventStore, calls: eventStoreCalls } = traceCalls(
    createMemoryEventStore<EventsRaisedByAggregateRoots<typeof airlineAggregateRoots>>(),
  );
  const aggregateRootRepository = createSnapshottingAggregateRootRepository({
    eventStore: eventStore,
    aggregateRoots: airlineAggregateRoots,
    snapshotStorage: createMemorySnapshotStorage(),
  });

  it("can avoid loading the full event stream", async () => {
    await aggregateRootRepository.persist({
      aggregateRoot: {
        aggregateRootId: "VA-497",
        aggregateRootType: "FLIGHT",
        state: undefined,
      },
      pendingEventPayloads: [
        {
          type: "NEW_FLIGHT_SCHEDULED",
          seatingCapacity: 100,
        },
        {
          type: "PASSENGER_BOARDED",
          passengerName: "Harold Gribble",
          passportNumber: "PA1234567",
        },
      ],
    });

    await eventStore.persist([
      {
        aggregateVersion: 3,
        aggregateRootId: "VA-497",
        aggregateRootType: "FLIGHT",
        recordedAt: new Date(),
        payload: {
          type: "PASSENGER_BOARDED",
          passengerName: "Fred Gribble",
          passportNumber: "PA4567",
        },
      },
    ]);

    const aggregate = await aggregateRootRepository.retrieve({
      aggregateRootId: "VA-497",
      aggregateRootType: "FLIGHT",
    });

    // The event store is only required to retrieve events from version 2 of the aggregate,
    // satisfying the rest of the requirements from the snapshot storage.
    assertEquals(eventStoreCalls[2], {
      name: "retrieve",
      args: [
        {
          aggregateRootId: "VA-497",
          aggregateRootType: "FLIGHT",
          fromVersion: 2,
        },
      ],
    });

    assertEquals(aggregate.state, {
      totalSeats: 100,
      totalBoardedPassengers: 2,
      passengerManifest: { PA1234567: "Harold Gribble", PA4567: "Fred Gribble" },
      status: "ON_THE_GROUND",
    });
  });
});
