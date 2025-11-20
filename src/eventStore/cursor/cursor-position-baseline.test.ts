import { afterAll, beforeEach, it } from "@std/testing/bdd";
import { createMemoryCursorPosition, createPersistentLockingCursorPosition } from "@ts-event-core/framework";
import { prepareTestDatabaseContainer } from "../../../test/integration/utils/prepareTestDatabaseContainer.ts";
import { describeAll } from "../../../test/integration/utils/describeAll.ts";
import { createTestConnection } from "../../../test/integration/utils/infra/testPostgresConnectionOptions.ts";
import { assertEquals } from "@std/assert";

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

    it("should acquire and update positions", async () => {
      const cursor = factory();
      const { position } = await cursor.acquire();

      assertEquals(position, 0);
    });
  },
);
