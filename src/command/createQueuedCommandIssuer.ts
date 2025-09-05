import { CommandIssuer } from "./CommandIssuer.ts";
import {
  AggregateRootDefinitionMap,
  AggregateRootDefinitionMapTypes,
} from "../aggregate/AggregateRootDefinition.ts";
import { AggregateRootRepository } from "../aggregate/AggregateRootRepository.ts";

/**
 * An immediate command issuer processes commands right away. This is in contrast to other kinds
 * of command issuers which may acknowledge commands to be processed later or provide additional
 * features.
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
