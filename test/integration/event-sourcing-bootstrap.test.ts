import { assertEquals } from "@std/assert";
import { describe, it } from "jsr:@std/testing/bdd";
import { tryThing } from "./utils/tryThing.ts";
import { bootstrapInMemory } from "./bootstrap/bootstrapInMemory.ts";

describe("event sourcing bootstrap", () => {
  it("allows commands to be issued", async () => {
    const { issueCommand, readModels, ...bootstrap } = bootstrapInMemory();
    await bootstrap.start();

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

    await tryThing(() =>
      assertEquals(readModels.passengerActivity, {
        "Waldo Mcdaniel": {
          flightsTaken: 1,
        },
      })
    );

    await tryThing(() =>
      assertEquals(readModels.eventLog, [
        "FLIGHT: NEW_FLIGHT_SCHEDULED",
        "GATE: GATE_OPENED",
        "GATE: BOARDING_PASS_SCANNED",
        "GATE: GATE_CLOSED",
        "FLIGHT: FLIGHT_DEPARTED",
        "FLIGHT: FLIGHT_LANDED",
        "FLIGHT: PASSENGER_BOARDED",
      ])
    );

    await bootstrap.halt();
  });
});
