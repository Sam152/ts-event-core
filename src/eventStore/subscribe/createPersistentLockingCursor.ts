import { Cursor } from "./Cursor.ts";
import postgres, { JSONValue } from "postgres";

/**
 * Requirements:
 *  - Have a table with columns: name, position.
 *  - When We get the position, we start a transaction and acquire a row level lock on the position.
 *  - When we update the position, we set the position, then commit the transaction.
 *  - If the row doesn't exist, it is upserted with a default position of 0.
 */
export function createPersistentLockingCursor(
  { connection: sql, id }: { connection: ReturnType<typeof postgres>; id: string },
): Cursor {
  return {
    position: async () => {
      return 0;
    },
    update: async (position) => {
      // @todo
    },
  };
}
