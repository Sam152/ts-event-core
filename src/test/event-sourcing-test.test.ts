import {createBasicCommandIssuer} from "../command/createBasicCommandIssuer.ts";
import {gateAggregateType} from "./airlineDomain/aggregates/gate/gateAggregateType.ts";
import {planeAggregateType} from "./airlineDomain/aggregates/plane/planeAggregateType.ts";
import {createMemoryEventStore} from "../eventStore/createMemoryEventStore.ts";

Deno.test("you can do event sourcing", async () => {
  const issueCommand = createBasicCommandIssuer({
    aggregates: {
      GATE: gateAggregateType,
      PLANE: planeAggregateType,
    },
    eventStore: createMemoryEventStore(),
  });

  await issueCommand({
    aggregateType: "PLANE",
    aggregateId: "VH-XYZ",
    command: "confirmLanding",
    data: undefined,
  });
  await issueCommand({
    aggregateType: "PLANE",
    aggregateId: "VH-XYZ",
    command: "confirmTakeOff",
    data: undefined,
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
});
