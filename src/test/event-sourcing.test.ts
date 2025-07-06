import { createImmediateCommandIssuer } from "../command/immediate/createImmediateCommandIssuer.ts";
import { airlineAggregateRoots, AirlineEvent } from "./airlineDomain/aggregateRoot/airlineAggregateRoots.ts";
import { boardingProcessManager } from "./airlineDomain/processManager/boardingProcessManager.ts";
import { createMemoryEventStore } from "../eventStore/memory/createMemoryEventStore.ts";
import { createMemoryReducedProjector } from "../projector/memory/createMemoryReducedProjector.ts";
import {
  flightActivityLogInitialState,
  flightActivityLogReducer,
} from "./airlineDomain/projection/flightActivityLog.ts";
import { assertEquals } from "@std/assert";
import { createAggregateRootRepository } from "../aggregate/repository/createAggregateRootRepository.ts";

Deno.test("you can build an event sourced system", async () => {
  const eventStore = createMemoryEventStore<AirlineEvent>();
  const issueCommand = createImmediateCommandIssuer({
    aggregateRoots: airlineAggregateRoots,
    aggregateRootRepository: createAggregateRootRepository({
      aggregateRoots: airlineAggregateRoots,
      eventStore,
    }),
  });

  const flightActivityLog = createMemoryReducedProjector({
    initialState: flightActivityLogInitialState,
    reducer: flightActivityLogReducer,
  });

  eventStore.addSubscriber(flightActivityLog.projector);
  eventStore.addSubscriber((event) => boardingProcessManager({ event, issueCommand }));

  await issueCommand({
    aggregateRootType: "PLANE",
    aggregateRootId: "VH-XYZ",
    command: "confirmTakeOff",
    data: undefined,
  });
  await issueCommand({
    aggregateRootType: "GATE",
    command: "scanBoardingPass",
    aggregateRootId: "PER-T4-A5",
    data: {
      passengerName: "Foo",
      passportNumber: "13",
    },
  });
  await issueCommand({
    aggregateRootType: "PLANE",
    aggregateRootId: "VH-XYZ",
    command: "confirmTakeOff",
    data: undefined,
  });
  await issueCommand({
    aggregateRootType: "PLANE",
    aggregateRootId: "VH-XYZ",
    command: "confirmLanding",
    data: undefined,
  });

  assertEquals(flightActivityLog.data, {
    planes: {
      "VH-XYZ": {
        tripsFlown: 1,
      },
    },
    passengers: {},
  });
});
