import { createImmediateCommandIssuer } from "../command/createImmediateCommandIssuer.ts";
import { createMemoryEventStore } from "../eventStore/createMemoryEventStore.ts";
import { airlineAggregateRoots, AirlineEvent } from "./airlineDomain/aggregateRoots/airlineAggregateRoots.ts";
import { boardingProcessManager } from "./airlineDomain/processManagers/boardingProcessManager.ts";

Deno.test("you can do event sourcing", async () => {
  const eventStore = createMemoryEventStore<AirlineEvent>();
  const issueCommand = createImmediateCommandIssuer({
    aggregateRoots: airlineAggregateRoots,
    eventStore: eventStore,
  });

  eventStore.addSubscriber((event) => boardingProcessManager(event, issueCommand));

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
