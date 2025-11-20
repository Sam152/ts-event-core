import { assertEquals } from "@std/assert";
import { afterAll, beforeEach, it } from "@std/testing/bdd";
import { describeAll } from "../../test/integration/utils/describeAll.ts";
import { createInMemoryEventStore } from "./createInMemoryEventStore.ts";
import { createPostgresEventStore } from "./createPostgresEventStore.ts";
import { prepareTestDatabaseContainer } from "../../test/integration/utils/prepareTestDatabaseContainer.ts";
import { assertRejects } from "@std/assert/rejects";
import { AggregateRootVersionIntegrityError } from "./error/AggregateRootVersionIntegrityError.ts";
import type { AirlineDomainEvent } from "@ts-event-core/airline-domain";
import { createTestConnection } from "../../test/integration/utils/infra/testPostgresConnectionOptions.ts";

const connection = createTestConnection();

const implementations = [
  {
    factory: createInMemoryEventStore<AirlineDomainEvent>,
    beforeEachHook: () => undefined,
    afterAllHook: () => undefined,
  },
  {
    factory: () => createPostgresEventStore<AirlineDomainEvent>({ connection }),
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
          aggregateRootType: "FLIGHT",
          aggregateRootId: "VA456",
        }))).map((e) => e.payload.type),
        [
          "FLIGHT_SCHEDULED",
          "TICKET_PURCHASED",
          "TICKET_PURCHASED",
        ],
      );
    });

    it("should retrieve events from specific version", async () => {
      const eventStore = factory();
      await eventStore.persist(testEventStream);
      const retrievedEvents = eventStore.retrieve({
        aggregateRootType: "FLIGHT",
        aggregateRootId: "VA456",
        fromVersion: 2,
      });
      assertEquals((await retrievedEvents.next()).value.aggregateVersion, 3);
      assertEquals((await retrievedEvents.next()).value, undefined);
    });

    it("should return empty array for non-existent aggregate", async () => {
      assertEquals(
        (await factory().retrieve({
          aggregateRootType: "FLIGHT",
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

    it("should retrieve all events in insertion order with pagination", async () => {
      const eventStore = factory();
      await eventStore.persist(testEventStream);
      assertEquals(
        (await Array.fromAsync(eventStore.retrieveAll({
          idGt: 1,
          limit: 2,
        }))).map((e) => e.payload.type),
        [
          "TICKET_PURCHASED",
          "TICKET_PURCHASED",
        ],
      );
    });
    it("should retrieve no events if filtering on an ID greater than the last", async () => {
      const eventStore = factory();
      await eventStore.persist(testEventStream);
      assertEquals(
        (await Array.fromAsync(eventStore.retrieveAll({
          idGt: 4,
          limit: 1000,
        }))).map((e) => e.payload.type),
        [],
      );
    });
  },
);

const testEventStream: AirlineDomainEvent[] = [
  {
    recordedAt: new Date("2023-01-01T10:00:00Z"),
    aggregateRootType: "FLIGHT",
    aggregateRootId: "VA456",
    aggregateVersion: 1,
    payload: {
      type: "FLIGHT_SCHEDULED",
      sellableSeats: 100,
      departureTime: new Date(1000000),
    },
  },
  {
    recordedAt: new Date("2023-01-01T11:00:00Z"),
    aggregateRootType: "FLIGHT",
    aggregateRootId: "VA456",
    aggregateVersion: 2,
    payload: {
      type: "TICKET_PURCHASED",
      passengerId: "PA-111110",
      purchasePrice: {
        currency: "AUD",
        cents: 100_00,
      },
    },
  },
  {
    recordedAt: new Date("2023-01-01T12:00:00Z"),
    aggregateRootType: "FLIGHT",
    aggregateRootId: "VA456",
    aggregateVersion: 3,
    payload: {
      type: "TICKET_PURCHASED",
      passengerId: "PA-456789",
      purchasePrice: {
        currency: "AUD",
        cents: 110_00,
      },
    },
  },
  {
    recordedAt: new Date("2023-01-01T10:00:00Z"),
    aggregateRootType: "FLIGHT",
    aggregateRootId: "VA987",
    aggregateVersion: 1,
    payload: {
      type: "FLIGHT_SCHEDULED",
      sellableSeats: 45,
      departureTime: new Date(1001000),
    },
  },
];
