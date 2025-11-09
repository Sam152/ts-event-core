import { CommandIssuer } from "./CommandIssuer.ts";
import {
  AggregateRootDefinitionMap,
  AggregateRootDefinitionMapTypes,
} from "../aggregate/AggregateRootDefinition.ts";
import { AggregateRootRepository } from "../aggregate/AggregateRootRepository.ts";

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
): CommandIssuer<TAggregateMap, TAggregateMapTypes> {
  return async ({ aggregateRootType, aggregateRootId, command, data }) => {
    // @todo find a suitable queue implementation.
  };
}
