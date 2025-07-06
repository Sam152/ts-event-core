import { createImmediateCommandIssuer } from "../command/immediate/createImmediateCommandIssuer.ts";
import { airlineAggregateRoots, AirlineEvent } from "./airlineDomain/aggregateRoot/airlineAggregateRoots.ts";
import { createMemoryEventStore } from "../eventStore/memory/createMemoryEventStore.ts";
import { createAggregateRootRepository } from "../aggregate/repository/createAggregateRootRepository.ts";

const issueCommand = createImmediateCommandIssuer({
  aggregateRoots: airlineAggregateRoots,
  aggregateRootRepository: createAggregateRootRepository({
    aggregateRoots: airlineAggregateRoots,
    eventStore: createMemoryEventStore<AirlineEvent>(),
  }),
});

Deno.test("produces type errors given an invalid aggregate type", async () => {
  const _params: Parameters<typeof issueCommand>[0] = {
    // @ts-expect-error - this should produce a type error.
    aggregateRootType: "NOT_AN_AGGREGATE",
    // @ts-expect-error - this should produce a type error.
    command: "NOT_A_COMMAND",
    aggregateRootId: "PER-T4-A5",
    // @ts-expect-error - this should produce a type error.
    data: {
      incorrectCommandData: true,
    },
  };
});

Deno.test("produces type errors given an invalid command", async () => {
  const _params: Parameters<typeof issueCommand>[0] = {
    aggregateRootType: "PLANE",
    // @ts-expect-error - this should produce a type error.
    command: "NOT_A_COMMAND",
    aggregateRootId: "PER-T4-A5",
    // @ts-expect-error - this should produce a type error.
    data: {
      incorrectCommandData: true,
    },
  };
});

Deno.test("produces type errors given invalid command data", async () => {
  const _params: Parameters<typeof issueCommand>[0] = {
    aggregateRootType: "PLANE",
    // @ts-expect-error - this should produce a type error.
    command: "confirmPassengerBoarding",
    aggregateRootId: "PER-T4-A5",
    // @ts-expect-error - this should produce a type error.
    data: {
      incorrectCommandData: true,
    },
  };
});
