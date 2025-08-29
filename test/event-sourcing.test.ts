import { createBasicCommander } from "../src/command/createBasicCommander.ts";
import { airlineAggregateRoots, AirlineEvent } from "./airlineDomain/aggregateRoot/airlineAggregateRoots.ts";
import { boardingProcessManager } from "./airlineDomain/processManager/boardingProcessManager.ts";
import { createInMemoryEventStore } from "../src/eventStore/createInMemoryEventStore.ts";
import { createMemoryReducedProjector } from "../src/projector/createMemoryReducedProjector.ts";
import { assertEquals } from "@std/assert";
import {
  passengerActivityInitialState,
  passengerActivityReducer,
} from "./airlineDomain/readModels/passengerActivity.ts";
import { eventLogInitialState, eventLogReducer } from "./airlineDomain/readModels/eventLog.ts";
import { describe, it } from "jsr:@std/testing/bdd";
import {
  createSnapshottingAggregateRootRepository,
} from "../src/aggregate/repository/createSnapshottingAggregateRootRepository.ts";
import { createInMemorySnapshotStorage } from "../src/aggregate/snapshot/createInMemorySnapshotStorage.ts";

describe("event sourcing", () => {
  const eventStore = createInMemoryEventStore<AirlineEvent>();
  const issueCommand = createBasicCommander({
    aggregateRoots: airlineAggregateRoots,
    aggregateRootRepository: createSnapshottingAggregateRootRepository({
      aggregateRoots: airlineAggregateRoots,
      eventStore,
      snapshotStorage: createInMemorySnapshotStorage(),
    }),
  });
  eventStore.addSubscriber((event) => boardingProcessManager({event, issueCommand}));

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

  it("allows commands to be issued", async () => {
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
  });

  it("produces projections from the resulting event stream", async () => {
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
});
