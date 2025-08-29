import { assertEquals } from "@std/assert";
import { afterAll, beforeEach, it } from "@std/testing/bdd";
import postgres from "postgres";
import { createInMemorySnapshotStorage } from "./createInMemorySnapshotStorage.ts";
import { createPostgresSnapshotStorage } from "./createPostgresSnapshotStorage.ts";
import { describeAll } from "../../../test/utils/describeAll.ts";
import { prepareTestDatabaseContainer } from "../../../test/utils/prepareTestDatabaseContainer.ts";
import { testPostgresConnectionOptions } from "../../../test/utils/infra/testPostgresConnectionOptions.ts";
import { AggregateRootInstance } from "../AggregateRootInstance.ts";

const connection = postgres(testPostgresConnectionOptions);

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

    it("should persist and retrieve snapshots", async () => {
      const storage = factory();

      await storage.persist({
        aggregateRoot: testAggregateSnapshot,
        aggregateRootStateVersion: 1,
      });

      const retrieved = await storage.retrieve({
        aggregateRootType: "FLIGHT",
        aggregateRootId: "VA-497",
        aggregateRootStateVersion: 1,
      });

      assertEquals(retrieved, testAggregateSnapshot);
    });

    it("should return undefined for non-existent snapshots", async () => {
      assertEquals(await factory().retrieve({
        aggregateRootType: "FLIGHT",
        aggregateRootId: "non-existent",
        aggregateRootStateVersion: 1,
      }), undefined);
    });

    it("should overwrite existing snapshots with same key", async () => {
      const storage = factory();

      await storage.persist({
        aggregateRoot: testAggregateSnapshot,
        aggregateRootStateVersion: 1,
      });

      const updatedSnapshot = {
        ...testAggregateSnapshot,
        state: {
          ...testAggregateSnapshot.state,
          totalBoardedPassengers: 5,
        },
        aggregateVersion: 10,
      };

      await storage.persist({
        aggregateRoot: updatedSnapshot,
        aggregateRootStateVersion: 1,
      });

      const retrieved = await storage.retrieve({
        aggregateRootType: "FLIGHT",
        aggregateRootId: "VA-497",
        aggregateRootStateVersion: 1,
      });

      assertEquals(retrieved, updatedSnapshot);
    });

    it("should handle different state versions for same aggregate", async () => {
      const storage = factory();

      await storage.persist({
        aggregateRoot: testAggregateSnapshot,
        aggregateRootStateVersion: 1,
      });

      const differentVersionSnapshot = {
        ...testAggregateSnapshot,
        state: {
          ...testAggregateSnapshot.state,
          totalBoardedPassengers: 8,
        },
      };

      await storage.persist({
        aggregateRoot: differentVersionSnapshot,
        aggregateRootStateVersion: 2,
      });

      const version1 = await storage.retrieve({
        aggregateRootType: "FLIGHT",
        aggregateRootId: "VA-497",
        aggregateRootStateVersion: 1,
      });

      const version2 = await storage.retrieve({
        aggregateRootType: "FLIGHT",
        aggregateRootId: "VA-497",
        aggregateRootStateVersion: 2,
      });

      assertEquals(version1?.state.totalBoardedPassengers, 2);
      assertEquals(version2?.state.totalBoardedPassengers, 8);
    });
  },
);

const testAggregateSnapshot = {
  aggregateRootType: "FLIGHT",
  aggregateRootId: "VA-497",
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
}  as const satisfies AggregateRootInstance<"FLIGHT", any>;
