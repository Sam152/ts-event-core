import { Event, EventStore } from "../EventStore.ts";
import postgres from "postgres";
import { AggregateRootVersionIntegrityError } from "../error/AggregateRootVersionIntegrityError.ts";
import { JSONValue } from "npm:postgres@3.4.7";

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
 *
 * This implementation assumes that events are not inserted in the context of a transaction,
 * since no effort is made to linearize the events inserted. Implementations using this event
 * store must respond to AggregateRootVersionIntegrityError, as a means of optimistic locking
 * on an individual aggregate root and attempt to retry commands.
 */
export function createPostgresEventStore<TEvent extends Event>(
  { connection: sql }: { connection: ReturnType<typeof postgres> },
): EventStore<TEvent> {
  return {
    persist: async (events) => {
      if (events.length === 0) {
        return;
      }
      try {
        await sql`
          INSERT INTO event_core.events ${
          sql(
            events.map((event) => ({
              aggregateRootType: event.aggregateRootType,
              aggregateRootId: event.aggregateRootId,
              aggregateVersion: event.aggregateVersion,
              payload: event.payload as JSONValue,
            })),
          )
        }
        `;
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
