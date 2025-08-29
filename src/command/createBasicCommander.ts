import { Commander } from "./Commander.ts";
import { AggregateRootDefinitionMap, AggregateRootDefinitionMapTypes, } from "../aggregate/AggregateRootDefinition.ts";
import { AggregateRootRepository } from "../aggregate/AggregateRootRepository.ts";

/**
 * An immediate command issuer processes commands right away. This is in contrast to other kinds
 * of command issuers which may acknowledge commands to be processed later or provide additional
 * features.
 */
export function createBasicCommander<
  TAggregateMap extends AggregateRootDefinitionMap<TAggregateMapTypes>,
  TAggregateMapTypes extends AggregateRootDefinitionMapTypes,
>(
  {aggregateRootRepository, aggregateRoots}: {
    aggregateRoots: TAggregateMap;
    aggregateRootRepository: AggregateRootRepository<TAggregateMap, TAggregateMapTypes>;
  },
): Commander<TAggregateMap, TAggregateMapTypes> {
  return async ({aggregateRootType, aggregateRootId, command, data}) => {
    const aggregate = await aggregateRootRepository.retrieve({
      aggregateRootId,
      aggregateRootType,
    });

    const commandMap = aggregateRoots[aggregateRootType].commands;
    const commandFunction = commandMap[command as keyof typeof commandMap];

    const commandResult = commandFunction(aggregate.state, data);
    const raisedEvents = Array.isArray(commandResult) ? commandResult : [commandResult];

    // @todo catch AggregateRootVersionIntegrityError and retry the command.
    await aggregateRootRepository.persist({
      aggregateRoot: aggregate,
      pendingEventPayloads: raisedEvents,
    });
  };
}
