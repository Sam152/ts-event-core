import { createBasicCommandIssuer } from "@ts-event-core/framework";
import { createInMemoryEventStore } from "@ts-event-core/framework";
import { createBasicAggregateRootRepository } from "@ts-event-core/framework";
import { describe, it } from "@std/testing/bdd";
import { airlineAggregateRoots, AirlineDomainEvent } from "@ts-event-core/airline-domain";

const issueCommand = createBasicCommandIssuer({
  aggregateRoots: airlineAggregateRoots,
  aggregateRootRepository: createBasicAggregateRootRepository({
    aggregateRoots: airlineAggregateRoots,
    eventStore: createInMemoryEventStore<AirlineDomainEvent>(),
  }),
});

describe("type safety", () => {
  it("produces type errors given an invalid aggregate type", async () => {
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

  it("produces type errors given an invalid command", async () => {
    const _params: Parameters<typeof issueCommand>[0] = {
      aggregateRootType: "FLIGHT",
      // @ts-expect-error - this should produce a type error.
      command: "NOT_A_COMMAND",
      aggregateRootId: "PER-T4-A5",
      // @ts-expect-error - this should produce a type error.
      data: {
        incorrectCommandData: true,
      },
    };
  });

  it("produces type errors given invalid command data", async () => {
    const _params: Parameters<typeof issueCommand>[0] = {
      aggregateRootType: "FLIGHT",
      // @ts-expect-error - this should produce a type error.
      command: "confirmPassengerBoarding",
      aggregateRootId: "PER-T4-A5",
      // @ts-expect-error - this should produce a type error.
      data: {
        incorrectCommandData: true,
      },
    };
  });
});
