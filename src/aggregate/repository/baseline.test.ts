import { airlineAggregateRoots } from "../../../test/airlineDomain/aggregateRoot/airlineAggregateRoots.ts";
import { createMemorySnapshotStorage } from "../snapshot/createMemorySnapshotStorage.ts";
import { createMemoryEventStore } from "../../eventStore/memory/createMemoryEventStore.ts";
import { EventsRaisedByAggregateRoots } from "../../eventStore/EventStore.ts";
import { createSnapshottingAggregateRootRepository } from "./createSnapshottingAggregateRootRepository.ts";
import { assertEquals } from "@std/assert";
import { it } from "jsr:@std/testing/bdd";
import { describeAll } from "../../../test/utils/describeAll.ts";
import { createBasicAggregateRootRepository } from "./createBasicAggregateRootRepository.ts";

const snapshotting = createSnapshottingAggregateRootRepository({
  eventStore: createMemoryEventStore<EventsRaisedByAggregateRoots<typeof airlineAggregateRoots>>(),
  aggregateRoots: airlineAggregateRoots,
  snapshotStorage: createMemorySnapshotStorage(),
});

const basic = createBasicAggregateRootRepository({
  eventStore: createMemoryEventStore<EventsRaisedByAggregateRoots<typeof airlineAggregateRoots>>(),
  aggregateRoots: airlineAggregateRoots,
});

describeAll("aggregate root repository", [snapshotting, basic], (repository) => {
  it("can persist and retrieve an aggregate", async () => {
    await repository.persist({
      aggregate: {
        aggregateRootId: "VA-497",
        aggregateRootType: "FLIGHT",
        state: undefined,
      },
      pendingEvents: [
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

    const aggregate = await repository.retrieve({
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

  it("can persist and retrieve an existing aggregate", async () => {
    const aggregate = await repository.retrieve({
      aggregateRootId: "VA-497",
      aggregateRootType: "FLIGHT",
    });

    await repository.persist({
      aggregate,
      pendingEvents: [
        {
          type: "PASSENGER_BOARDED",
          passengerName: "Sally Gribble",
          passportNumber: "PA78965",
        },
      ],
    });

    const retrievedAgain = await repository.retrieve({
      aggregateRootId: "VA-497",
      aggregateRootType: "FLIGHT",
    });

    assertEquals(retrievedAgain, {
      aggregateRootId: "VA-497",
      aggregateRootType: "FLIGHT",
      aggregateVersion: 3,
      state: {
        totalSeats: 100,
        totalBoardedPassengers: 2,
        passengerManifest: { PA1234567: "Harold Gribble", PA78965: "Sally Gribble" },
        status: "ON_THE_GROUND",
      },
    });
  });
});
