import { it } from "jsr:@std/testing/bdd";

import { bootstrapInMemory } from "./bootstrap/bootstrapInMemory.ts";
import { bootstrapProduction } from "./bootstrap/bootstrapProduction.ts";
import { beforeEach } from "@std/testing/bdd";
import { prepareTestDatabaseContainer } from "./utils/prepareTestDatabaseContainer.ts";
import { describeAll } from "./utils/describeAll.ts";
import { wait } from "./utils/wait.ts";

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
        aggregateRootId: "VA-456",
        command: "scheduleFlight",
        data: {
          departureTime: new Date(1002020202020),
          sellableSeats: 150,
        },
      });

      await wait(1000);

      await bootstrap.halt();
    });
  },
);
