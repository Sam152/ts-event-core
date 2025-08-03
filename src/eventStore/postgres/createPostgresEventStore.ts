import { Event, EventStore } from "../EventStore.ts";
import postgres from "postgres";
import { JSONValue } from "npm:postgres@3.4.7";
import { AggregateRootVersionIntegrityError } from "../error/AggregateRootVersionIntegrityError.ts";

/**
 * A persistent event store backed by Postgres.
 *
 * This implementation depends on the following schema:
 *
 * ```sql
 *   CREATE TABLE event_core.events
 *   (
 *       id                  BIGSERIAL PRIMARY KEY,
 *       "aggregateRootType" TEXT        NOT NULL,
 *       "aggregateRootId"   TEXT        NOT NULL,
 *       "aggregateVersion"  INT         NOT NULL,
 *       "recordedAt"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *       payload             JSONB       NOT NULL,
 *
 *       CONSTRAINT "aggregateIntegrity"
 *           UNIQUE ("aggregateRootType", "aggregateRootId", "aggregateVersion")
 *   );
 * ```
 */
export function createPostgresEventStore<TEvent extends Event>(
  { connection: sql }: { connection: ReturnType<typeof postgres> },
): EventStore<TEvent> {
  return {
    persist: async (events) => {
      try {
        // @todo: batch insert these events.
        for (const event of events) {
          await sql`
            INSERT INTO event_core.events 
              ("aggregateRootType", "aggregateRootId", "aggregateVersion", "payload")
            VALUES 
              (
                ${event.aggregateRootType},
                ${event.aggregateRootId},
                ${event.aggregateVersion},
                ${sql.json(event.payload as JSONValue)}
              )
            RETURNING *;
          `;
        }
      } catch (error) {
        const isAggregateIntegrityError = error &&
          typeof error === "object" &&
          "constraint_name" in error &&
          error.constraint_name === "aggregateIntegrity";

        if (isAggregateIntegrityError) {
          throw new AggregateRootVersionIntegrityError();
        }

        throw error;
      }
    },

    retrieve: async function* ({
      aggregateRootType,
      aggregateRootId,
      fromVersion = 0,
    }: {
      aggregateRootType: string;
      aggregateRootId: string;
      fromVersion?: number;
    }) {
      const cursor = sql<TEvent[]>`
        SELECT *
        FROM "event_core"."events"
        WHERE "aggregateRootType" = ${aggregateRootType}
          AND "aggregateRootId" = ${aggregateRootId}
          AND "aggregateVersion" > ${fromVersion}
        ORDER BY "aggregateVersion" ASC
    `.cursor(1000);

      for await (const rows of cursor) {
        yield* rows;
      }
    },
  };
}
