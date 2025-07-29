import { assertEquals } from "@std/assert";
import { afterAll, beforeEach, it } from "jsr:@std/testing/bdd";
import { describeAll } from "../../test/utils/describeAll.ts";
import { AirlineEvent } from "../../test/airlineDomain/aggregateRoot/airlineAggregateRoots.ts";
import { createMemoryEventStore } from "./memory/createMemoryEventStore.ts";
import { createPostgresEventStore } from "./postgres/createPostgresEventStore.ts";
import { prepareTestDatabaseContainer } from "../../test/utils/prepareTestDatabaseContainer.ts";
import postgres from "postgres";
import { testPostgresConnectionOptions } from "../../test/utils/infra/testPostgresConnectionOptions.ts";
import { assertRejects } from "@std/assert/rejects";
import { AggregateRootVersionIntegrityError } from "./error/AggregateRootVersionIntegrityError.ts";

const connection = postgres(testPostgresConnectionOptions);

const implementations = [
  {
    factory: createMemoryEventStore<AirlineEvent>,
    beforeEachHook: () => undefined,
    afterAllHook: () => undefined,
  },
  {
    factory: () => createPostgresEventStore<AirlineEvent>({ connection }),
    beforeEachHook: prepareTestDatabaseContainer,
    afterAllHook: connection.end,
  },
];

describeAll(
  "event store baseline",
  implementations,
  ({ factory, beforeEachHook, afterAllHook }) => {
    beforeEach(beforeEachHook);
    afterAll(afterAllHook);

    it("should persist and retrieve events", async () => {
      const eventStore = factory();
      await eventStore.persist(testEventStream);
      assertEquals(
        (await Array.fromAsync(eventStore.retrieve({
          aggregateRootType: "PLANE",
          aggregateRootId: "plane-001",
        }))).map((e) => e.payload.type),
        [
          "NEW_FLIGHT_SCHEDULED",
          "PASSENGER_BOARDED",
          "FLIGHT_DEPARTED",
        ],
      );
    });

    it("should retrieve events from specific version", async () => {
      const eventStore = factory();
      await eventStore.persist(testEventStream);
      const retrievedEvents = eventStore.retrieve({
        aggregateRootType: "PLANE",
        aggregateRootId: "plane-001",
        fromVersion: 2,
      });
      assertEquals((await retrievedEvents.next()).value.aggregateVersion, 3);
      assertEquals((await retrievedEvents.next()).value, undefined);
    });

    it("should return empty array for non-existent aggregate", async () => {
      assertEquals(
        (await factory().retrieve({
          aggregateRootType: "PLANE",
          aggregateRootId: "non-existent",
        }).next()).value,
        undefined,
      );
    });

    it("should throw an error when attempting to persist a version collision", async () => {
      const eventStore = factory();
      await eventStore.persist([testEventStream[0]]);

      await assertRejects(
        () => eventStore.persist([testEventStream[0]]),
        AggregateRootVersionIntegrityError,
      );
    });
  },
);

const testEventStream: AirlineEvent[] = [
  {
    recordedAt: new Date("2023-01-01T10:00:00Z"),
    aggregateRootType: "PLANE",
    aggregateRootId: "plane-001",
    aggregateVersion: 1,
    payload: {
      type: "NEW_FLIGHT_SCHEDULED",
      seatingCapacity: 180,
    },
  },
  {
    recordedAt: new Date("2023-01-01T11:00:00Z"),
    aggregateRootType: "PLANE",
    aggregateRootId: "plane-001",
    aggregateVersion: 2,
    payload: {
      type: "PASSENGER_BOARDED",
      passengerName: "John Doe",
      passportNumber: "P123456",
    },
  },
  {
    recordedAt: new Date("2023-01-01T12:00:00Z"),
    aggregateRootType: "PLANE",
    aggregateRootId: "plane-001",
    aggregateVersion: 3,
    payload: {
      type: "FLIGHT_DEPARTED",
    },
  },
  {
    recordedAt: new Date("2023-01-01T10:00:00Z"),
    aggregateRootType: "PLANE",
    aggregateRootId: "plane-002",
    aggregateVersion: 1,
    payload: {
      type: "NEW_FLIGHT_SCHEDULED",
      seatingCapacity: 220,
    },
  },
];
