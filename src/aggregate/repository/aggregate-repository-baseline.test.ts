import { airlineAggregateRoots } from "../../../test/airlineDomain/aggregateRoot/airlineAggregateRoots.ts";
import { createMemorySnapshotStorage } from "../snapshot/createMemorySnapshotStorage.ts";
import { createMemoryEventStore } from "../../eventStore/createMemoryEventStore.ts";
import { EventsRaisedByAggregateRoots } from "../../eventStore/EventStore.ts";
import { createSnapshottingAggregateRootRepository } from "./createSnapshottingAggregateRootRepository.ts";
import { assertEquals } from "@std/assert";
import { it } from "jsr:@std/testing/bdd";
import { describeAll } from "../../../test/utils/describeAll.ts";
import { createBasicAggregateRootRepository } from "./createBasicAggregateRootRepository.ts";

const snapshottingEventStore = createMemoryEventStore<
  EventsRaisedByAggregateRoots<typeof airlineAggregateRoots>
>();
const snapshotting = createSnapshottingAggregateRootRepository({
  eventStore: snapshottingEventStore,
  aggregateRoots: airlineAggregateRoots,
  snapshotStorage: createMemorySnapshotStorage(),
});

const basicEventStore = createMemoryEventStore<EventsRaisedByAggregateRoots<typeof airlineAggregateRoots>>();
const basic = createBasicAggregateRootRepository({
  eventStore: basicEventStore,
  aggregateRoots: airlineAggregateRoots,
});

describeAll(
  "aggregate root repository baseline",
  [{
    repository: snapshotting,
    eventStore: snapshottingEventStore,
  }, {
    repository: basic,
    eventStore: basicEventStore,
  }],
  ({ repository, eventStore }) => {
    it("can persist and retrieve an aggregate", async () => {
      await repository.persist({
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
        aggregateRoot: aggregate,
        pendingEventPayloads: [
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

    it("can retrieve an aggregate, based on events written by another process", async () => {
      // Persist directly into the event store, to simulate events becoming available in
      // another process, outside this specific instance of a repository.
      await eventStore.persist([
        {
          aggregateVersion: 4,
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

      const retrievedAgain = await repository.retrieve({
        aggregateRootId: "VA-497",
        aggregateRootType: "FLIGHT",
      });
      assertEquals(retrievedAgain, {
        aggregateRootId: "VA-497",
        aggregateRootType: "FLIGHT",
        aggregateVersion: 4,
        state: {
          totalSeats: 100,
          totalBoardedPassengers: 3,
          passengerManifest: {
            PA1234567: "Harold Gribble",
            PA78965: "Sally Gribble",
            PA4567: "Fred Gribble",
          },
          status: "ON_THE_GROUND",
        },
      });
    });
  },
);
