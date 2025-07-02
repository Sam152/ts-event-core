import {assertEquals, assertRejects} from "@std/assert";
import {createMemoryEventStore} from "./createMemoryEventStore.ts";
import {Event} from "./EventStore.ts";
import {UniqueConstraintViolationError} from "./UniqueConstraintViolationError.ts";
import {PlaneEvent} from "../test/airlineDomain/aggregates/plane/state/planeReducer.ts";

const testEventStream: Event<PlaneEvent>[] = [
  {
    recordedAt: new Date("2023-01-01T10:00:00Z"),
    aggregateType: "PLANE",
    aggregateId: "plane-001",
    aggregateVersion: 1,
    payload: {
      type: "PLANE_ENTERED_SERVICE",
      seatingCapacity: 180,
    },
  },
  {
    recordedAt: new Date("2023-01-01T11:00:00Z"),
    aggregateType: "PLANE",
    aggregateId: "plane-001",
    aggregateVersion: 2,
    payload: {
      type: "PASSENGER_BOARDED",
      passengerName: "John Doe",
      passportNumber: "P123456",
    },
  },
  {
    recordedAt: new Date("2023-01-01T12:00:00Z"),
    aggregateType: "PLANE",
    aggregateId: "plane-001",
    aggregateVersion: 3,
    payload: {
      type: "FLIGHT_DEPARTED",
    },
  },
  {
    recordedAt: new Date("2023-01-01T10:00:00Z"),
    aggregateType: "PLANE",
    aggregateId: "plane-002",
    aggregateVersion: 1,
    payload: {
      type: "PLANE_ENTERED_SERVICE",
      seatingCapacity: 220,
    },
  },
];

Deno.test("should persist and retrieve events", async () => {
  const eventStore = createMemoryEventStore<PlaneEvent>();
  await eventStore.persist(testEventStream);
  assertEquals(
    (await eventStore.retrieve({
      aggregateType: "PLANE",
      aggregateId: "plane-001",
    })).map((e) => e.payload.type),
    [
      "PLANE_ENTERED_SERVICE",
      "PASSENGER_BOARDED",
      "FLIGHT_DEPARTED",
    ],
  );
});

Deno.test("should retrieve events from specific version", async () => {
  const eventStore = createMemoryEventStore<PlaneEvent>();
  await eventStore.persist(testEventStream);
  const retrievedEvents = await eventStore.retrieve({
    aggregateType: "PLANE",
    aggregateId: "plane-001",
    fromVersion: 2,
  });
  assertEquals(retrievedEvents.length, 1);
  assertEquals(retrievedEvents[0].aggregateVersion, 3);
});

Deno.test("should return empty array for non-existent aggregate", async () => {
  assertEquals(
    (await createMemoryEventStore().retrieve({
      aggregateType: "PLANE",
      aggregateId: "non-existent",
    })).length,
    0,
  );
});

Deno.test("should throw UniqueConstraintViolationError for duplicate version", async () => {
  const eventStore = createMemoryEventStore<PlaneEvent>();

  await eventStore.persist([testEventStream[0]]);

  await assertRejects(
    () => eventStore.persist([testEventStream[0]]),
    UniqueConstraintViolationError,
  );
});
