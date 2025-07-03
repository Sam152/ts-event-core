import { createBasicCommandIssuer } from "../command/createBasicCommandIssuer.ts";
import { createMemoryEventStore } from "../eventStore/createMemoryEventStore.ts";
import { airlineAggregates } from "./airlineDomain/aggregates/airlineAggregates.ts";

Deno.test("you can do event sourcing", async () => {
  const issueCommand = createBasicCommandIssuer({
    aggregates: airlineAggregates,
    eventStore: createMemoryEventStore(),
  });

  await issueCommand({
    aggregateType: "GATE",
    command: "scanBoardingPass",
    aggregateId: "PER-T4-A5",
    data: {
      passengerName: "Foo",
      passportNumber: "13",
    },
  });
  await issueCommand({
    aggregateType: "PLANE",
    aggregateId: "VH-XYZ",
    command: "confirmTakeOff",
    data: undefined,
  });
  await issueCommand({
    aggregateType: "PLANE",
    aggregateId: "VH-XYZ",
    command: "confirmLanding",
    data: undefined,
  });
});
