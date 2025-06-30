import { assertEquals, assertRejects } from "@std/assert";
import { createMemoryEventStore } from "./createMemoryEventStore.ts";
import { EventEnvelope } from "./EventStore.ts";
import { UniqueConstraintViolationError } from "./UniqueConstraintViolationError.ts";
import { PlaneEvent } from "../test/airlineDomain/plane/state/planeReducer.ts";

Deno.test("should persist and retrieve events", async () => {
  const eventStore = createMemoryEventStore<PlaneEvent>();

  await eventStore.persist([
    {
      recordedAt: new Date("2023-01-01T10:00:00Z"),
      aggregateType: "PLANE",
      aggregateId: "plane-123",
      aggregateVersion: 1,
      event: {
        type: "PLANE_ENTERED_SERVICE",
        seatingCapacity: 180,
      },
    },
    {
      recordedAt: new Date("2023-01-01T11:00:00Z"),
      aggregateType: "PLANE",
      aggregateId: "plane-123",
      aggregateVersion: 2,
      event: {
        type: "PASSENGER_BOARDED",
        passengerName: "John Doe",
        passportNumber: "P123456",
      },
    },
  ]);

  const retrievedEvents = await eventStore.retrieve({
    aggregateType: "PLANE",
    aggregateId: "plane-123",
  });

  assertEquals(retrievedEvents.length, 2);
  assertEquals(retrievedEvents[0].event.type, "PLANE_ENTERED_SERVICE");
  assertEquals(retrievedEvents[1].event.type, "PASSENGER_BOARDED");
});

Deno.test("should retrieve events from specific version", async () => {
  const eventStore = createMemoryEventStore();

  await eventStore.persist([
    {
      recordedAt: new Date("2023-01-01T10:00:00Z"),
      aggregateType: "PLANE",
      aggregateId: "plane-456",
      aggregateVersion: 1,
      event: {
        type: "PLANE_ENTERED_SERVICE",
        seatingCapacity: 200,
      },
    },
    {
      recordedAt: new Date("2023-01-01T11:00:00Z"),
      aggregateType: "PLANE",
      aggregateId: "plane-456",
      aggregateVersion: 2,
      event: {
        type: "FLIGHT_DEPARTED",
      },
    },
    {
      recordedAt: new Date("2023-01-01T12:00:00Z"),
      aggregateType: "PLANE",
      aggregateId: "plane-456",
      aggregateVersion: 3,
      event: {
        type: "FLIGHT_ARRIVED",
      },
    },
  ]);

  const retrievedEvents = await eventStore.retrieve({
    aggregateType: "PLANE",
    aggregateId: "plane-456",
    fromVersion: 2,
  });

  assertEquals(retrievedEvents.length, 2);
  assertEquals(retrievedEvents[0].aggregateVersion, 2);
  assertEquals(retrievedEvents[1].aggregateVersion, 3);
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
  const eventStore = createMemoryEventStore();

  await eventStore.persist([{
    recordedAt: new Date("2023-01-01T10:00:00Z"),
    aggregateType: "PLANE",
    aggregateId: "plane-789",
    aggregateVersion: 1,
    event: {
      type: "PLANE_ENTERED_SERVICE",
      seatingCapacity: 150,
    },
  }]);

  await assertRejects(
    () =>
      eventStore.persist([{
        recordedAt: new Date("2023-01-01T11:00:00Z"),
        aggregateType: "PLANE",
        aggregateId: "plane-789",
        aggregateVersion: 1,
        event: {
          type: "PASSENGER_BOARDED",
          passengerName: "Jane Smith",
          passportNumber: "P789012",
        },
      }]),
    UniqueConstraintViolationError,
  );
});

Deno.test("should handle multiple aggregates independently", async () => {
  const eventStore = createMemoryEventStore();

  await eventStore.persist([{
    recordedAt: new Date("2023-01-01T10:00:00Z"),
    aggregateType: "PLANE",
    aggregateId: "plane-001",
    aggregateVersion: 1,
    event: {
      type: "PLANE_ENTERED_SERVICE",
      seatingCapacity: 180,
    },
  }]);

  await eventStore.persist([{
    recordedAt: new Date("2023-01-01T10:00:00Z"),
    aggregateType: "PLANE",
    aggregateId: "plane-002",
    aggregateVersion: 1,
    event: {
      type: "PLANE_ENTERED_SERVICE",
      seatingCapacity: 220,
    },
  }]);

  const plane001Events = await eventStore.retrieve({
    aggregateType: "PLANE",
    aggregateId: "plane-001",
  });

  const plane002Events = await eventStore.retrieve({
    aggregateType: "PLANE",
    aggregateId: "plane-002",
  });

  assertEquals(plane001Events.length, 1);
  assertEquals(plane002Events.length, 1);
  assertEquals(plane001Events[0].aggregateId, "plane-001");
  assertEquals(plane002Events[0].aggregateId, "plane-002");
});

Deno.test("should persist multiple events in single call", async () => {
  const eventStore = createMemoryEventStore();

  await eventStore.persist([
    {
      recordedAt: new Date("2023-01-01T10:00:00Z"),
      aggregateType: "PLANE",
      aggregateId: "plane-multi",
      aggregateVersion: 1,
      event: {
        type: "PLANE_ENTERED_SERVICE",
        seatingCapacity: 300,
      },
    },
    {
      recordedAt: new Date("2023-01-01T11:00:00Z"),
      aggregateType: "PLANE",
      aggregateId: "plane-multi",
      aggregateVersion: 2,
      event: {
        type: "PASSENGER_BOARDED",
        passengerName: "Alice Johnson",
        passportNumber: "P111111",
      },
    },
    {
      recordedAt: new Date("2023-01-01T12:00:00Z"),
      aggregateType: "PLANE",
      aggregateId: "plane-multi",
      aggregateVersion: 3,
      event: {
        type: "PASSENGER_BOARDED",
        passengerName: "Bob Wilson",
        passportNumber: "P222222",
      },
    },
  ]);

  const retrievedEvents = await eventStore.retrieve({
    aggregateType: "PLANE",
    aggregateId: "plane-multi",
  });

  assertEquals(retrievedEvents.length, 3);
  assertEquals(retrievedEvents[0].aggregateVersion, 1);
  assertEquals(retrievedEvents[1].aggregateVersion, 2);
  assertEquals(retrievedEvents[2].aggregateVersion, 3);
});
