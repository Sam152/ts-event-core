import { createBasicCommandIssuer } from "../src/command/createBasicCommandIssuer.ts";
import { airlineAggregateRoots, AirlineEvent } from "./airlineDomain/aggregateRoot/airlineAggregateRoots.ts";
import { boardingProcessManager } from "./airlineDomain/processManager/boardingProcessManager.ts";
import { createInMemoryEventStore } from "../src/eventStore/createInMemoryEventStore.ts";
import { createMemoryReducedProjector } from "../src/projection/createMemoryReducedProjector.ts";
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
import { createPollingEventStoreSubscriber } from "../src/eventStore/subscriber/createPollingEventStoreSubscriber.ts";
import { createMemoryCursorPosition } from "../src/eventStore/cursor/createMemoryCursorPosition.ts";
import { tryThing } from "./utils/tryThing.ts";

describe("event sourcing", () => {
  it("allows commands to be issued", async () => {
    const eventStore = createInMemoryEventStore<AirlineEvent>();
    const issueCommand = createBasicCommandIssuer({
      aggregateRoots: airlineAggregateRoots,
      aggregateRootRepository: createSnapshottingAggregateRootRepository({
        aggregateRoots: airlineAggregateRoots,
        eventStore,
        snapshotStorage: createInMemorySnapshotStorage(),
      }),
    });

    const passengerActivity = createMemoryReducedProjector({
      initialState: passengerActivityInitialState,
      reducer: passengerActivityReducer,
    });

    const eventLog = createMemoryReducedProjector({
      initialState: eventLogInitialState,
      reducer: eventLogReducer,
    });

    const projections = createPollingEventStoreSubscriber({
      cursor: createMemoryCursorPosition(),
      eventStore,
    });
    projections.addSubscriber(eventLog.projector);
    projections.addSubscriber(passengerActivity.projector);
    await projections.start();

    const processManager = createPollingEventStoreSubscriber({
      cursor: createMemoryCursorPosition(),
      eventStore,
    });
    processManager.addSubscriber((event) => boardingProcessManager({ event, issueCommand }));
    await processManager.start();

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

    // Give the projections a chance to catch up.

    await tryThing(() =>
      assertEquals(passengerActivity.data, {
        "Waldo Mcdaniel": {
          flightsTaken: 1,
        },
      })
    );

    await tryThing(() =>
      assertEquals(eventLog.data, [
        "FLIGHT: NEW_FLIGHT_SCHEDULED",
        "GATE: GATE_OPENED",
        "GATE: BOARDING_PASS_SCANNED",
        "GATE: GATE_CLOSED",
        "FLIGHT: FLIGHT_DEPARTED",
        "FLIGHT: FLIGHT_LANDED",
        "FLIGHT: PASSENGER_BOARDED",
      ])
    );

    await processManager.halt();
    await projections.halt();
  });
});
