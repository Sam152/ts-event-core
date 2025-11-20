import type { CursorPosition } from "./CursorPosition.ts";
import type postgres from "postgres";
import { wait } from "../../../test/integration/utils/wait.ts";

/**
 * A persistent cursor position backed by Postgres with row-level locking.
 *
 * This implementation depends on the following schema:
 *
 * ```sql
 *   CREATE TABLE event_core.cursor
 *   (
 *       id       TEXT   PRIMARY KEY,
 *       position BIGINT NOT NULL DEFAULT 0
 *   );
 * ```
 */
export function createPersistentLockingCursorPosition(
  { connection: sql, id }: { connection: ReturnType<typeof postgres>; id: string },
): CursorPosition {
  async function acquire(): ReturnType<CursorPosition["acquire"]> {
    const attempt: Awaited<ReturnType<CursorPosition["acquire"]>> | "LOCKED" = await sql.begin(
      async (txn) => {
        await txn`
          INSERT INTO event_core.cursor (id, position)
          VALUES (${id}, 0)
          ON CONFLICT (id) DO NOTHING
        `;
        const [row] = await txn`
          SELECT position
          FROM event_core.cursor
          WHERE id = ${id}
          FOR UPDATE SKIP LOCKED
        `;

        if (!row) {
          return "LOCKED";
        }

        return {
          position: BigInt(row.position),
          update: async (newPosition: bigint) => {
            await txn`UPDATE event_core.cursor SET position = ${newPosition.toString()} WHERE id = ${id}`;
          },
        };
      },
    );

    if (attempt === "LOCKED") {
      await wait(100);
      return await acquire();
    }

    return attempt;
  }

  return {
    acquire,
  };
}
