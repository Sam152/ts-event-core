import type { CommandIssuer } from "../CommandIssuer.ts";
import type {
  AggregateRootDefinitionMap,
  AggregateRootDefinitionMapTypes,
} from "../../aggregate/AggregateRootDefinition.ts";
import type { AggregateRootRepository } from "../../aggregate/AggregateRootRepository.ts";
import type postgres from "postgres";
import type { JSONValue } from "npm:postgres@3.4.7";
import { type QueueSignal, workQueue } from "./workQueue.ts";

export type QueuedCommandIssuer<
  TAggregateMap extends AggregateRootDefinitionMap<TAggregateMapTypes>,
  TAggregateMapTypes extends AggregateRootDefinitionMapTypes,
> = {
  issueCommand: CommandIssuer<TAggregateMap, TAggregateMapTypes>;
  startQueueWorker: () => {
    halt: () => Promise<void>;
  };
};

/**
 * Commands do not need to be processed right away. A queued command handler may be useful
 * to implement features that depend on persistent command storage. Features like durable
 * processing in the event of system failure, distributed processing, idempotency, scheduling
 * and pessimistic locking can be implemented in a queued issuer.
 *
 * This implementation depends on the following schema:
 *
 * ```sql
 * CREATE TYPE event_core.command_queue_status AS ENUM ('pending', 'complete');
 *
 * CREATE TABLE event_core.command_queue
 * (
 *     id                  BIGSERIAL PRIMARY KEY,
 *     "aggregateRootType" TEXT                            NOT NULL,
 *     "aggregateRootId"   TEXT                            NOT NULL,
 *     "commandName"       TEXT                            NOT NULL,
 *     "commandData"       JSONB                           NOT NULL,
 *     "raisedEvents"      BIGINT[]                        NOT NULL DEFAULT '{}',
 *     status              event_core.command_queue_status NOT NULL DEFAULT 'pending',
 *     "issuedAt"          TIMESTAMPTZ                     NOT NULL DEFAULT clock_timestamp(),
 *     "completedAt"       TIMESTAMPTZ
 * );
 *
 * CREATE INDEX idx_command_queue_pending
 *     ON event_core.command_queue (id) WHERE status = 'pending';
 *
 * CREATE OR REPLACE FUNCTION event_core.set_completed_at()
 *     RETURNS TRIGGER AS $$
 * BEGIN
 *     IF NEW.status = 'complete' AND OLD.status != 'complete' THEN
 *         NEW."completedAt" = clock_timestamp();
 *     END IF;
 *     RETURN NEW;
 * END;
 * $$ LANGUAGE plpgsql;
 *
 * CREATE TRIGGER trg_set_completed_at
 *     BEFORE UPDATE ON event_core.command_queue
 *     FOR EACH ROW
 *     EXECUTE FUNCTION event_core.set_completed_at();
 * ```
 */
export function createQueuedCommandIssuer<
  TAggregateMap extends AggregateRootDefinitionMap<TAggregateMapTypes>,
  TAggregateMapTypes extends AggregateRootDefinitionMapTypes,
>(
  {
    aggregateRootRepository,
    aggregateRoots,
    connection: sql,
  }: {
    aggregateRoots: TAggregateMap;
    aggregateRootRepository: AggregateRootRepository<
      TAggregateMap,
      TAggregateMapTypes
    >;
    pollIntervalMs?: number;
    connection: ReturnType<typeof postgres>;
  },
): QueuedCommandIssuer<TAggregateMap, TAggregateMapTypes> {
  return {
    issueCommand: async (
      { aggregateRootType, aggregateRootId, command, data },
    ) => {
      await sql`
          INSERT INTO event_core.command_queue ("aggregateRootType", "aggregateRootId", "commandName", "commandData")
          VALUES (${String(aggregateRootType)}, ${aggregateRootId}, ${String(command)}, ${
        sql.json(data as JSONValue)
      })`;
    },
    startQueueWorker: () => {
      const signal: QueueSignal = { status: "WORKING" };
      const workingPromise = workQueue({ signal, sql, aggregateRoots, aggregateRootRepository });
      return {
        halt: async () => {
          signal.status = "HALTED";
          await workingPromise;
        },
      };
    },
  };
}
