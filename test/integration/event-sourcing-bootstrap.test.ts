import { assertEquals } from "@std/assert";
import { it } from "jsr:@std/testing/bdd";
import { tryThing } from "./utils/tryThing.ts";
import { bootstrapInMemory } from "./bootstrap/bootstrapInMemory.ts";
import { bootstrapProduction } from "./bootstrap/bootstrapProduction.ts";
import { beforeEach } from "@std/testing/bdd";
import { prepareTestDatabaseContainer } from "./utils/prepareTestDatabaseContainer.ts";
import { describeAll } from "./utils/describeAll.ts";

const implementations = [
  {
    bootstrapFn: bootstrapInMemory,
    beforeEachHook: () => undefined,
  },
  {
    bootstrapFn: bootstrapProduction,
    beforeEachHook: prepareTestDatabaseContainer,
  },
];

describeAll(
  "event sourcing bootstrap",
  implementations,
  ({ bootstrapFn, beforeEachHook }) => {
    beforeEach(beforeEachHook);

    it("bootstraps a configuration of the event sourcing system", async () => {
      const { issueCommand, readModels, ...bootstrap } = bootstrapFn();
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
        assertEquals(readModels.passengerActivity.data, {
          "Waldo Mcdaniel": {
            flightsTaken: 1,
          },
        })
      );

      await tryThing(() =>
        assertEquals(readModels.eventLog.data, [
          "FLIGHT: FLIGHT_SCHEDULED",
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
  },
);
