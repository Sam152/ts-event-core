import { createInMemorySnapshotStorage } from "../snapshot/createInMemorySnapshotStorage.ts";
import { createInMemoryEventStore } from "../../eventStore/createInMemoryEventStore.ts";
import { EventsRaisedByAggregateRoots } from "../../eventStore/EventStore.ts";
import { createSnapshottingAggregateRootRepository } from "./createSnapshottingAggregateRootRepository.ts";

import { it } from "@std/testing/bdd";
import { describeAll } from "../../../test/integration/utils/describeAll.ts";
import { createBasicAggregateRootRepository } from "./createBasicAggregateRootRepository.ts";
import { airlineAggregateRoots } from "@ts-event-core/airline-domain";
import { assertEquals } from "@std/assert";

const snapshottingEventStore = createInMemoryEventStore<
  EventsRaisedByAggregateRoots<typeof airlineAggregateRoots>
>();
const snapshotting = createSnapshottingAggregateRootRepository({
  eventStore: snapshottingEventStore,
  aggregateRoots: airlineAggregateRoots,
  snapshotStorage: createInMemorySnapshotStorage(),
});

const basicEventStore = createInMemoryEventStore<
  EventsRaisedByAggregateRoots<typeof airlineAggregateRoots>
>();
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

      const aggregate = await repository.retrieve({
        aggregateRootId: "VA497",
        aggregateRootType: "FLIGHT",
      });

      assertEquals(aggregate, {
        aggregateRootId: "VA497",
        aggregateRootType: "FLIGHT",
        aggregateVersion: 2,
        state: {
          status: "SCHEDULED",
          totalSeats: 100,
          totalAvailableSeats: 99,
          totalSeatsSold: 1,
          passengerManifest: ["PA-111110"],
        },
      });
    });

    it("can persist and retrieve an existing aggregate", async () => {
      const aggregate = await repository.retrieve({
        aggregateRootId: "VA497",
        aggregateRootType: "FLIGHT",
      });

      await repository.persist({
        aggregateRoot: aggregate,
        pendingEventPayloads: [
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

      const retrievedAgain = await repository.retrieve({
        aggregateRootId: "VA497",
        aggregateRootType: "FLIGHT",
      });

      assertEquals(retrievedAgain, {
        aggregateRootId: "VA497",
        aggregateRootType: "FLIGHT",
        aggregateVersion: 3,
        state: {
          status: "SCHEDULED",
          totalSeats: 100,
          totalAvailableSeats: 98,
          totalSeatsSold: 2,
          passengerManifest: ["PA-111110", "PA-111110"],
        },
      });
    });

    it("can retrieve an aggregate, based on events written by another process", async () => {
      // Persist directly into the event store, to simulate events becoming available in
      // another process, outside this specific instance of a repository.
      await eventStore.persist([
        {
          aggregateVersion: 4,
          aggregateRootId: "VA497",
          aggregateRootType: "FLIGHT",
          recordedAt: new Date(),
          payload: {
            type: "TICKET_PURCHASED",
            passengerId: "PA-456789",
            purchasePrice: {
              currency: "AUD",
              cents: 110_00,
            },
          },
        },
      ]);

      const retrievedAgain = await repository.retrieve({
        aggregateRootId: "VA497",
        aggregateRootType: "FLIGHT",
      });
      assertEquals(retrievedAgain, {
        aggregateRootId: "VA497",
        aggregateRootType: "FLIGHT",
        aggregateVersion: 4,
        state: {
          status: "SCHEDULED",
          totalSeats: 100,
          totalAvailableSeats: 97,
          totalSeatsSold: 3,
          passengerManifest: ["PA-111110", "PA-111110", "PA-456789"],
        },
      });
    });
  },
);
