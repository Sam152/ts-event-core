import { createImmediateCommandIssuer } from "../command/createImmediateCommandIssuer.ts";
import { airlineAggregateRoots } from "./airlineDomain/aggregateRoot/airlineAggregateRoots.ts";
import { createMemoryEventStore } from "../eventStore/memory/createMemoryEventStore.ts";

const issueCommand = createImmediateCommandIssuer({
  aggregateRoots: airlineAggregateRoots,
  eventStore: createMemoryEventStore(),
});

Deno.test("produces type errors given an invalid aggregate type", async () => {
  await issueCommand({
    // @ts-expect-error - this should produce a type error.
    aggregateType: "NOT_AN_AGGREGATE",
    // @ts-expect-error - this should produce a type error.
    command: "NOT_A_COMMAND",
    aggregateId: "PER-T4-A5",
    // @ts-expect-error - this should produce a type error.
    data: {
      incorrectCommandData: true,
    },
  });
});

Deno.test("produces type errors given an invalid command", async () => {
  await issueCommand({
    aggregateType: "PLANE",
    // @ts-expect-error - this should produce a type error.
    command: "NOT_A_COMMAND",
    aggregateId: "PER-T4-A5",
    data: {
      // @ts-expect-error - this should produce a type error.
      incorrectCommandData: true,
    },
  });
});

Deno.test("produces type errors given invalid command data", async () => {
  await issueCommand({
    aggregateType: "PLANE",
    command: "confirmPassengerBoarding",
    aggregateId: "PER-T4-A5",
    data: {
      // @ts-expect-error - this should produce a type error.
      incorrectCommandData: true,
    },
  });
});
