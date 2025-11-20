import type { CursorPosition } from "./CursorPosition.ts";
import type postgres from "postgres";

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
      await sql`INSERT INTO event_core.cursor (id, position) VALUES (${id}, 0) ON CONFLICT (id) DO NOTHING`;

      const lock = await sql.reserve();
      await lock`BEGIN`;
      await lock`SELECT pg_advisory_xact_lock(100)`;

      const [row] = await sql`
        SELECT position
        FROM event_core.cursor
        WHERE id = ${id}
      `;
      return {
        position: BigInt(row.position),
        update: async (newPosition: bigint) => {
          await sql`
            UPDATE event_core.cursor
            SET position = ${newPosition.toString()}
            WHERE id = ${id}
          `;

          await lock`COMMIT`;
          lock.release();
        },
      };
    },
  };
}
