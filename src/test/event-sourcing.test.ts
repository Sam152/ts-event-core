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
  eventStore.addSubscriber((event) => boardingProcessManager({ event, issueCommand }));

  const flightActivityLog = createMemoryReducedProjector({
    initialState: flightActivityLogInitialState,
    reducer: flightActivityLogReducer,
  });
  eventStore.addSubscriber(flightActivityLog.projector);

  await issueCommand({
    aggregateRootType: "PLANE",
    command: "registerNewPlaneReadyForService",
    aggregateRootId: "TEC-152",
    data: {
      seatingCapacity: 123,
    },
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
    aggregateRootId: "TEC-152",
    command: "confirmTakeOff",
    data: undefined,
  });
  await issueCommand({
    aggregateRootType: "PLANE",
    aggregateRootId: "TEC-152",
    command: "confirmLanding",
    data: undefined,
  });

  assertEquals(flightActivityLog.data, {
    planes: {
      "TEC-152": {
        tripsFlown: 1,
      },
    },
    passengers: {
      "Foo:13": {
        flightsTaken: 1,
      },
    },
  });
});
