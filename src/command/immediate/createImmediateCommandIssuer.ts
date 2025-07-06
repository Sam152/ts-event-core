import { Commander } from "../Commander.ts";
import { AggregateRootDefinitionMap } from "../../aggregate/AggregateRootDefinition.ts";
import { AggregateRootRepository } from "../../aggregate/AggregateRootRepository.ts";

/**
 * An immediate command issuer processes commands right away. This is in contrast to other kinds
 * of command issuers which may acknowledge commands to be processed later or provide additional
 * features.
 */
export function createImmediateCommandIssuer<
  TAggregateMap extends AggregateRootDefinitionMap,
>(
  { aggregateRootRepository, aggregateRoots }: {
    aggregateRoots: TAggregateMap;
    aggregateRootRepository: AggregateRootRepository<TAggregateMap>;
  },
): Commander<TAggregateMap> {
  return async ({ aggregateRootType, aggregateRootId, command, data }) => {
    const aggregate = await aggregateRootRepository.retrieve({
      aggregateRootId,
      aggregateRootType,
    });

    const commandMap = aggregateRoots[aggregateRootType].commands;
    const commandFunction = commandMap[command as keyof typeof commandMap];

    const commandResult = commandFunction(aggregate.state, data);
    const raisedEvents = Array.isArray(commandResult) ? commandResult : [commandResult];

    await aggregateRootRepository.persist({
      aggregate,
      raisedEvents,
    });
  };
}
