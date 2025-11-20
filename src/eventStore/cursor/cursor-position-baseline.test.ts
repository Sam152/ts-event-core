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
    factory: () => createPersistentLockingCursorPosition({ connection, id: "test_cursor_position" }),
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
      const cursor = factory();

      const { position, update } = await cursor.acquire();
      assertEquals(position, 0);

      await update(30);
      assertEquals((await cursor.acquire()).position, 30);
    });

    it("should implement a lock, only resolving one position at a time", async () => {
      const cursor = factory();

      const callOne = cursor.acquire();
      const callTwo = cursor.acquire();
      const callThree = cursor.acquire();

      const { position: positionOne, update: updateOne } = await callOne;
      assertEquals(positionOne, 0);
      await updateOne(100);

      const { position: positionTwo, update: updateTwo } = await callTwo;
      assertEquals(positionTwo, 100);
      await updateTwo(200);

      const { position: positionThree } = await callThree;
      assertEquals(positionThree, 200);
    });
  },
);
