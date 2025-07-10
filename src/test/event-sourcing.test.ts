import { createImmediateCommandIssuer } from "../command/immediate/createImmediateCommandIssuer.ts";
import { airlineAggregateRoots, AirlineEvent } from "./airlineDomain/aggregateRoot/airlineAggregateRoots.ts";
import { boardingProcessManager } from "./airlineDomain/processManager/boardingProcessManager.ts";
import { createMemoryEventStore } from "../eventStore/memory/createMemoryEventStore.ts";
import { createMemoryReducedProjector } from "../projector/memory/createMemoryReducedProjector.ts";
import {
  flightActivityLogReducer,
  passengerActivityLogInitialState,
} from "./airlineDomain/projection/passengerActivityLog.ts";
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
    initialState: passengerActivityLogInitialState,
    reducer: flightActivityLogReducer,
  });
  eventStore.addSubscriber(flightActivityLog.projector);

  await issueCommand({
    aggregateRootType: "FLIGHT",
    command: "scheduleFlight",
    aggregateRootId: "VA-497",
    data: {
      seatingCapacity: 32,
    },
  });

  await issueCommand({
    aggregateRootType: "GATE",
    command: "openGate",
    aggregateRootId: "PERTH-T2-DOMESTIC-6",
    data: {
      openForFlight: "VA-497",
    },
  });
  await issueCommand({
    aggregateRootType: "GATE",
    command: "scanBoardingPass",
    aggregateRootId: "PERTH-T2-DOMESTIC-6",
    data: {
      passengerName: "Waldo Mcdaniel",
      passportNumber: "PA777",
    },
  });
  await issueCommand({
    aggregateRootType: "GATE",
    command: "closeGate",
    aggregateRootId: "PERTH-T2-DOMESTIC-6",
    data: undefined,
  });

  await issueCommand({
    aggregateRootType: "FLIGHT",
    aggregateRootId: "VA-497",
    command: "confirmTakeOff",
    data: undefined,
  });
  await issueCommand({
    aggregateRootType: "FLIGHT",
    aggregateRootId: "VA-497",
    command: "confirmLanding",
    data: undefined,
  });

  assertEquals(flightActivityLog.data, {
    "Waldo Mcdaniel": {
      flightsTaken: 1,
    },
  });
});
