import { afterAll, beforeEach, it } from "@std/testing/bdd";
import { createMemoryCursorPosition, createPersistentLockingCursorPosition } from "@ts-event-core/framework";
import { describeAll } from "../../../test/integration/utils/describeAll.ts";
import { createTestConnection } from "../../../test/integration/utils/infra/testPostgresConnectionOptions.ts";
import { assertEquals } from "@std/assert";
import { prepareTestDatabaseContainer } from "../../../test/integration/utils/prepareTestDatabaseContainer.ts";

const connection = createTestConnection();

const implementations = [
  {
    factory: createMemoryCursorPosition,
    beforeEachHook: () => undefined,
    afterAllHook: () => undefined,
  },
  {
    factory: () => createPersistentLockingCursorPosition({ connection, id: "test" }),
    beforeEachHook: prepareTestDatabaseContainer,
    afterAllHook: connection.end,
  },
];

describeAll(
  "cursor position baseline",
  implementations,
  ({ factory, beforeEachHook, afterAllHook }) => {
    beforeEach(beforeEachHook);
    afterAll(afterAllHook);

    it("should acquire and update a position", async () => {
      const cursor = await factory();

      const { position, update } = await cursor.acquire();
      assertEquals(position, 0n);

      await update(30n);

      const updated = await cursor.acquire();
      assertEquals(updated.position, 30n);
      await updated.update(40n);
    });

    it("should implement a lock, only resolving one position at a time", async () => {
      const cursor = await factory();

      const callOne = cursor.acquire();
      const callTwo = cursor.acquire();
      const callThree = cursor.acquire();

      const calls = new Set([callOne, callTwo, callThree]);

      const [firstToResolve] = await Promise.race(calls.values().map((p) => p.then((res) => [p])));
      calls.delete(firstToResolve);

      const { position: positionOne, update: updateOne } = await firstToResolve;
      assertEquals(positionOne, 0n);
      await updateOne(100n);

      const [secondToResolve] = await Promise.race(calls.values().map((p) => p.then((res) => [p])));
      calls.delete(secondToResolve);

      const { position: positionTwo, update: updateTwo } = await secondToResolve;
      assertEquals(positionTwo, 100n);
      await updateTwo(200n);

      const [thirdToResolve] = await Promise.race(calls.values().map((p) => p.then((res) => [p])));
      calls.delete(thirdToResolve);

      const { position: positionThree, update: updateThree } = await thirdToResolve;
      assertEquals(positionThree, 200n);
      await updateThree(300n);
    });
  },
);
