import type { CursorPosition } from "./CursorPosition.ts";
import type postgres from "postgres";
import { advisoryLock } from "../../util/advisoryLock.ts";

/**
 * A persistent cursor position backed by Postgres with advisory locking.
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
  { connection: sql, id }: {
    connection: ReturnType<typeof postgres>;
    id: string;
  },
): CursorPosition {
  return {
    acquire: async () => {
      const release = await advisoryLock({ id, connection: sql });
      const [row] = await sql`
        SELECT position
        FROM event_core.cursor
        WHERE id = ${id}
      `;
      return {
        position: row ? BigInt(row.position) : 0n,
        update: async (newPosition: bigint) => {
          await sql`
            INSERT INTO event_core.cursor (id, position)
            VALUES (${id}, ${newPosition.toString()})
            ON CONFLICT (id)
            DO UPDATE SET position = ${newPosition.toString()}
          `;
          await release();
        },
      };
    },
  };
}
