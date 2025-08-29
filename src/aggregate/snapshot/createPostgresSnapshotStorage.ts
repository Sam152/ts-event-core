import { AggregateRootDefinitionMap, AggregateRootDefinitionMapTypes } from "../AggregateRootDefinition.ts";
import { SnapshotStorage } from "../SnapshotStorage.ts";
import postgres, { JSONValue } from "postgres";

/**
 * A persistent snapshot storage backed by Postgres.
 *
 * This implementation depends on the following schema:
 *
 * ```sql
 *  CREATE TABLE event_core.snapshots
 * (
 *     id                          BIGSERIAL PRIMARY KEY,
 *     "aggregateRootType"         TEXT        NOT NULL,
 *     "aggregateRootId"           TEXT        NOT NULL,
 *     "aggregateRootStateVersion" TEXT        NOT NULL,
 *     "aggregateVersion"          INT,
 *     "recordedAt"                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *     state                       JSONB       NOT NULL,
 *     CONSTRAINT "snapshotAccess" UNIQUE ("aggregateRootType", "aggregateRootId", "aggregateRootStateVersion")
 * );
 * ```
 */
export function createPostgresSnapshotStorage<
  TAggregateDefinitionMap extends AggregateRootDefinitionMap<TAggregateMapTypes>,
  TAggregateMapTypes extends AggregateRootDefinitionMapTypes,
>(
  { connection: sql }: { connection: ReturnType<typeof postgres> },
): SnapshotStorage<TAggregateDefinitionMap, TAggregateMapTypes> {
  return {
    persist: async ({
      aggregateRoot,
      aggregateRootStateVersion,
    }) => {
      await sql`
        INSERT INTO event_core.snapshots ${
        sql({
          aggregateRootType: aggregateRoot.aggregateRootType.toString(),
          aggregateRootId: aggregateRoot.aggregateRootId,
          aggregateRootStateVersion: aggregateRootStateVersion,
          aggregateVersion: aggregateRoot.aggregateVersion,
          state: aggregateRoot.state as JSONValue,
        })
      } ON CONFLICT ("aggregateRootType", "aggregateRootId", "aggregateRootStateVersion") 
        DO UPDATE SET
          "aggregateVersion" = EXCLUDED."aggregateVersion",
          state = EXCLUDED.state,
          "recordedAt" = NOW()
      `;
    },
    retrieve: async ({
      aggregateRootType,
      aggregateRootId,
      aggregateRootStateVersion,
    }) => {
      const result = await sql`
        SELECT "aggregateRootType", "aggregateRootId", "aggregateVersion", state
        FROM "event_core"."snapshots"
        WHERE "aggregateRootType" = ${aggregateRootType as string}
          AND "aggregateRootId" = ${aggregateRootId}
          AND "aggregateRootStateVersion" = ${aggregateRootStateVersion}
      `;
      return result[0] ? {
        aggregateRootType,
        aggregateRootId: result[0].aggregateRootId,
        aggregateVersion: result[0].aggregateVersion,
        state: result[0].state,
      } : undefined;
    },
  };
}
