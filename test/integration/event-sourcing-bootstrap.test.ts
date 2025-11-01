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
      const { issueCommand, projections, ...bootstrap } = bootstrapFn();
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
      await tryThing(() =>
        assertEquals(readModels.passengerActivity.data, {
          "Waldo Mcdaniel": {
            flightsTaken: 1,
          },
        })
      );

      await issueCommand({
        aggregateRootType: "GATE",
        command: "closeGate",
        aggregateRootId: "PERTH-T2-DOMESTIC-6",
        data: undefined,
      });
      await issueCommand({
        aggregateRootType: "FLIGHT",
        aggregateRootId: "VA-497",
        command: "confirmTakeoff",
        data: undefined,
      });
      await issueCommand({
        aggregateRootType: "FLIGHT",
        aggregateRootId: "VA-497",
        command: "confirmLanding",
        data: undefined,
      });

      await tryThing(() =>
        assertEquals(readModels.eventLog.data, [
          "FLIGHT(VA-497): FLIGHT_SCHEDULED",
          "GATE(PERTH-T2-DOMESTIC-6): GATE_OPENED",
          "GATE(PERTH-T2-DOMESTIC-6): BOARDING_PASS_SCANNED",
          "FLIGHT(VA-497): PASSENGER_BOARDED",
          "GATE(PERTH-T2-DOMESTIC-6): GATE_CLOSED",
          "FLIGHT(VA-497): FLIGHT_DEPARTED",
          "FLIGHT(VA-497): FLIGHT_LANDED",
        ])
      );

      await bootstrap.halt();
    });
  },
);
