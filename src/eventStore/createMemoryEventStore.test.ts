import { assertEquals, assertRejects } from "jsr:@std/assert";
import { createMemoryEventStore } from "./createMemoryEventStore.ts";
import { UniqueConstraintViolationError } from "./UniqueConstraintViolationError.ts";
import { EventEnvelope } from "./EventStore.ts";
import { PlaneEvent } from "../test/airlineDomain/plane/state/planeReducer.ts";

Deno.test("createMemoryEventStore - persist and retrieve events", async () => {
  const eventStore = createMemoryEventStore();

  const events: EventEnvelope<unknown>[] = [
    {
      recordedAt: new Date(),
      aggregateType: "User",
      aggregateId: "user-1",
      aggregateVersion: 1,
      event: { type: "UserCreated", name: "John" },
    },
    {
      recordedAt: new Date(),
      aggregateType: "User",
      aggregateId: "user-1",
      aggregateVersion: 2,
      event: { type: "UserUpdated", name: "Jane" },
    },
  ];

  await eventStore.persist(events);

  const retrievedEvents = await eventStore.retrieve({
    aggregateType: "User",
    aggregateId: "user-1",
  });

  assertEquals(retrievedEvents.length, 2);
  assertEquals(retrievedEvents[0].aggregateVersion, 1);
  assertEquals(retrievedEvents[1].aggregateVersion, 2);
});

Deno.test("createMemoryEventStore - retrieve with fromVersion filter", async () => {
  const eventStore = createMemoryEventStore();

  const events: EventEnvelope<PlaneEvent>[] = [
    {
      recordedAt: new Date(),
      aggregateType: "User",
      aggregateId: "user-1",
      aggregateVersion: 1,
      event: { type: "UserCreated" },
    },
    {
      recordedAt: new Date(),
      aggregateType: "User",
      aggregateId: "user-1",
      aggregateVersion: 2,
      event: { type: "UserUpdated" },
    },
    {
      recordedAt: new Date(),
      aggregateType: "User",
      aggregateId: "user-1",
      aggregateVersion: 3,
      event: { type: "UserDeleted" },
    },
  ];

  await eventStore.persist(events);

  const retrievedEvents = await eventStore.retrieve({
    aggregateType: "User",
    aggregateId: "user-1",
    fromVersion: 2,
  });

  assertEquals(retrievedEvents.length, 2);
  assertEquals(retrievedEvents[0].aggregateVersion, 2);
  assertEquals(retrievedEvents[1].aggregateVersion, 3);
});

Deno.test("createMemoryEventStore - retrieve non-existent aggregate returns empty array", async () => {
  const eventStore = createMemoryEventStore();

  const retrievedEvents = await eventStore.retrieve({
    aggregateType: "User",
    aggregateId: "non-existent",
  });

  assertEquals(retrievedEvents.length, 0);
});

Deno.test("createMemoryEventStore - persist throws UniqueConstraintViolationError for duplicate version", async () => {
  const eventStore = createMemoryEventStore();

  const event: EventEnvelope<unknown> = {
    recordedAt: new Date(),
    aggregateType: "User",
    aggregateId: "user-1",
    aggregateVersion: 1,
    event: { type: "UserCreated" },
  };

  await eventStore.persist([event]);

  await assertRejects(
    () => eventStore.persist([event]),
    UniqueConstraintViolationError,
  );
});

Deno.test("createMemoryEventStore - separate aggregates don't interfere", async () => {
  const eventStore = createMemoryEventStore();

  const userEvent: EventEnvelope<unknown> = {
    recordedAt: new Date(),
    aggregateType: "User",
    aggregateId: "user-1",
    aggregateVersion: 1,
    event: { type: "UserCreated" },
  };

  const orderEvent: EventEnvelope<unknown> = {
    recordedAt: new Date(),
    aggregateType: "Order",
    aggregateId: "order-1",
    aggregateVersion: 1,
    event: { type: "OrderCreated" },
  };

  await eventStore.persist([userEvent, orderEvent]);

  const userEvents = await eventStore.retrieve({
    aggregateType: "User",
    aggregateId: "user-1",
  });

  const orderEvents = await eventStore.retrieve({
    aggregateType: "Order",
    aggregateId: "order-1",
  });

  assertEquals(userEvents.length, 1);
  assertEquals(orderEvents.length, 1);
  assertEquals(userEvents[0].event, { type: "UserCreated" });
  assertEquals(orderEvents[0].event, { type: "OrderCreated" });
});
