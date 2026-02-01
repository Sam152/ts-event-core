import type { CommandIssuer } from "../CommandIssuer.ts";
import type {
  AggregateRootDefinitionMap,
  AggregateRootDefinitionMapTypes,
} from "../../aggregate/AggregateRootDefinition.ts";
import type { AggregateRootRepository } from "../../aggregate/AggregateRootRepository.ts";

type QueueWorker = {};

/**
 * Commands do not need to be processed right away. A queued command handler may be useful
 * to implement features that depend on persistent command storage. Features like durable
 * processing in the event of system failure, distributed processing, idempotency, scheduling
 * and pessimistic locking can be implemented in a queued issuer.
 */
export function createQueuedCommandIssuer<
  TAggregateMap extends AggregateRootDefinitionMap<TAggregateMapTypes>,
  TAggregateMapTypes extends AggregateRootDefinitionMapTypes,
>(
  { aggregateRootRepository, aggregateRoots }: {
    aggregateRoots: TAggregateMap;
    aggregateRootRepository: AggregateRootRepository<TAggregateMap, TAggregateMapTypes>;
  },
): { issuer: CommandIssuer<TAggregateMap, TAggregateMapTypes>; queueWorker: QueueWorker } {
  return async ({ aggregateRootType, aggregateRootId, command, data }) => {
    // @todo find a suitable queue implementation.
  };
}
