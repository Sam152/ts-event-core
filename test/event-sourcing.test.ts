import { createImmediateCommandIssuer } from "../src/command/immediate/createImmediateCommandIssuer.ts";
import { airlineAggregateRoots, AirlineEvent } from "./airlineDomain/aggregateRoot/airlineAggregateRoots.ts";
import { boardingProcessManager } from "./airlineDomain/processManager/boardingProcessManager.ts";
import { createMemoryEventStore } from "../src/eventStore/memory/createMemoryEventStore.ts";
import { createMemoryReducedProjector } from "../src/projector/memory/createMemoryReducedProjector.ts";
import { assertEquals } from "@std/assert";
import { createAggregateRootRepository } from "../src/aggregate/repository/createAggregateRootRepository.ts";
import {
  passengerActivityInitialState,
  passengerActivityReducer,
} from "./airlineDomain/readModels/passengerActivity.ts";
import { eventLogInitialState, eventLogReducer } from "./airlineDomain/readModels/eventLog.ts";

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

  const passengerActivity = createMemoryReducedProjector({
    initialState: passengerActivityInitialState,
    reducer: passengerActivityReducer,
  });
  eventStore.addSubscriber(passengerActivity.projector);

  const eventLog = createMemoryReducedProjector({
    initialState: eventLogInitialState,
    reducer: eventLogReducer,
  });
  eventStore.addSubscriber(eventLog.projector);

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

  assertEquals(passengerActivity.data, {
    "Waldo Mcdaniel": {
      flightsTaken: 1,
    },
  });
  assertEquals(eventLog.data, [
    "FLIGHT: NEW_FLIGHT_SCHEDULED",
    "GATE: GATE_OPENED",
    "GATE: BOARDING_PASS_SCANNED",
    "FLIGHT: PASSENGER_BOARDED",
    "GATE: GATE_CLOSED",
    "FLIGHT: FLIGHT_DEPARTED",
    "FLIGHT: FLIGHT_LANDED",
  ]);
});
