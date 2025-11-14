import type { CursorPosition } from "./CursorPosition.ts";
import type postgres from "postgres";
import { createMemoryCursorPosition } from "@ts-event-core/framework";

/**
 * Requirements:
 *  - Have a table with columns: name, position.
 *  - When We get the position, we start a transaction and acquire a row level lock on the position.
 *  - When we update the position, we set the position, then commit the transaction.
 *  - If the row doesn't exist, it is upserted with a default position of 0.
 */
export function createPersistentLockingCursorPosition(
  { connection: sql, id }: { connection: ReturnType<typeof postgres>; id: string },
): CursorPosition {
  // @TODO - Implement the persistent locking cursor.
  return createMemoryCursorPosition();
}
