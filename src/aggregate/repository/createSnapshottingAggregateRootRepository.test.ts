import { airlineAggregateRoots } from "../../../test/airlineDomain/aggregateRoot/airlineAggregateRoots.ts";
import { createMemorySnapshotStorage } from "../snapshot/createMemorySnapshotStorage.ts";
import { createMemoryEventStore } from "../../eventStore/memory/createMemoryEventStore.ts";
import { EventsRaisedByAggregateRoots } from "../../eventStore/EventStore.ts";
import { createSnapshottingAggregateRootRepository } from "./createSnapshottingAggregateRootRepository.ts";
import { traceCalls } from "../../../test/utils/traceCalls.ts";
import { assertEquals } from "@std/assert";

Deno.test("can use snapshot storage, to avoid loading all events for an aggregate", async () => {
  const tracedEventStore = traceCalls(
    createMemoryEventStore<EventsRaisedByAggregateRoots<typeof airlineAggregateRoots>>(),
  );
  const aggregateRootRepository = createSnapshottingAggregateRootRepository({
    eventStore: tracedEventStore.proxy,
    aggregateRoots: airlineAggregateRoots,
    snapshotStorage: createMemorySnapshotStorage(),
  });

  await aggregateRootRepository.persist({
    aggregate: {
      aggregateRootId: "VA-497",
      aggregateRootType: "FLIGHT",
      state: undefined,
    },
    pendingPayloads: [
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

  const aggregate = await aggregateRootRepository.retrieve({
    aggregateRootId: "VA-497",
    aggregateRootType: "FLIGHT",
  });

  assertEquals(aggregate, {
    aggregateRootId: "VA-497",
    aggregateRootType: "FLIGHT",
    aggregateVersion: 2,
    state: {
      totalSeats: 100,
      totalBoardedPassengers: 1,
      passengerManifest: { PA1234567: "Harold Gribble" },
      status: "ON_THE_GROUND",
    },
  });
});
