import { assertEquals } from "@std/assert";
import { afterAll, beforeEach, it } from "@std/testing/bdd";
import { createInMemorySnapshotStorage } from "@ts-event-core/framework";
import { createPostgresSnapshotStorage } from "@ts-event-core/framework";
import { describeAll } from "../../../test/integration/utils/describeAll.ts";
import { prepareTestDatabaseContainer } from "../../../test/integration/utils/prepareTestDatabaseContainer.ts";
import { createTestConnection } from "../../../test/integration/utils/infra/testPostgresConnectionOptions.ts";
import type { AggregateRootInstance } from "../AggregateRootInstance.ts";

const connection = createTestConnection();

const implementations = [
  {
    factory: createInMemorySnapshotStorage,
    beforeEachHook: () => undefined,
    afterAllHook: () => undefined,
  },
  {
    factory: () => createPostgresSnapshotStorage({ connection }),
    beforeEachHook: prepareTestDatabaseContainer,
    afterAllHook: connection.end,
  },
];

describeAll(
  "snapshot storage baseline",
  implementations,
  ({ factory, beforeEachHook, afterAllHook }) => {
    beforeEach(beforeEachHook);
    afterAll(afterAllHook);

    it("persists and retrieves snapshots", async () => {
      const storage = factory();

      await storage.persist({
        aggregateRoot: testAggregateSnapshot,
        stateVersion: 1,
      });

      const retrieved = await storage.retrieve({
        aggregateRootType: "FLIGHT",
        aggregateRootId: "VA497",
        stateVersion: 1,
      });

      assertEquals(retrieved, testAggregateSnapshot);
    });

    it("returns undefined for non-existent snapshots", async () => {
      assertEquals(
        await factory().retrieve({
          aggregateRootType: "FLIGHT",
          aggregateRootId: "non-existent",
          stateVersion: 1,
        }),
        undefined,
      );
    });

    it("should overwrite existing snapshots with same key", async () => {
      const storage = factory();

      await storage.persist({
        aggregateRoot: testAggregateSnapshot,
        stateVersion: 1,
      });

      await storage.persist({
        aggregateRoot: {
          ...testAggregateSnapshot,
          state: {
            ...testAggregateSnapshot.state,
            totalBoardedPassengers: 5,
          },
          aggregateVersion: 10,
        },
        stateVersion: 1,
      });

      assertEquals(
        (await storage.retrieve({
          aggregateRootType: "FLIGHT",
          aggregateRootId: "VA497",
          stateVersion: 1,
        }))?.state?.totalBoardedPassengers,
        5,
      );
    });

    it("does not retrieve snapshots from incorrect versions", async () => {
      const storage = factory();
      await storage.persist({
        aggregateRoot: testAggregateSnapshot,
        stateVersion: 1,
      });
      assertEquals(
        await factory().retrieve({
          aggregateRootType: "FLIGHT",
          aggregateRootId: "VA497",
          stateVersion: 2,
        }),
        undefined,
      );
    });
  },
);

const testAggregateSnapshot = {
  aggregateRootType: "FLIGHT",
  aggregateRootId: "VA497",
  aggregateVersion: 3,
  state: {
    totalSeats: 100,
    totalBoardedPassengers: 2,
    passengerManifest: {
      PA1234567: "Harold Gribble",
      PA78965: "Sally Gribble",
    },
    status: "ON_THE_GROUND",
  },
} as const satisfies AggregateRootInstance<"FLIGHT", any>;
