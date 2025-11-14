import type { CommandIssuer } from "./CommandIssuer.ts";
import type {
  AggregateRootDefinitionMap,
  AggregateRootDefinitionMapTypes,
} from "../aggregate/AggregateRootDefinition.ts";
import type { AggregateRootRepository } from "../aggregate/AggregateRootRepository.ts";
import { AggregateRootVersionIntegrityError } from "../eventStore/error/AggregateRootVersionIntegrityError.ts";

/**
 * An immediate command issuer processes commands right away. This is in contrast to other kinds
 * of command issuers which may acknowledge commands to be processed later or provide additional
 * features.
 */
export function createBasicCommandIssuer<
  TAggregateMap extends AggregateRootDefinitionMap<TAggregateMapTypes>,
  TAggregateMapTypes extends AggregateRootDefinitionMapTypes,
>(
  { aggregateRootRepository, aggregateRoots }: {
    aggregateRoots: TAggregateMap;
    aggregateRootRepository: AggregateRootRepository<TAggregateMap, TAggregateMapTypes>;
  },
): CommandIssuer<TAggregateMap, TAggregateMapTypes> {
  return async function issueCommand({ aggregateRootType, aggregateRootId, command, data }) {
    const aggregate = await aggregateRootRepository.retrieve({
      aggregateRootId,
      aggregateRootType,
    });

    const commandMap = aggregateRoots[aggregateRootType].commands;
    const commandFunction = commandMap[command as keyof typeof commandMap];

    const commandResult = commandFunction(aggregate.state, data);
    const raisedEvents = Array.isArray(commandResult) ? commandResult : [commandResult];

    try {
      await aggregateRootRepository.persist({
        aggregateRoot: aggregate,
        pendingEventPayloads: raisedEvents,
      });
    } catch (e) {
      // In cases where there was a version integrity error, we can retry the command. This
      // will retrieve the latest version of the aggregate, and deriver a new command outcome
      // based on up-to-date data.
      if (e instanceof AggregateRootVersionIntegrityError) {
        return await issueCommand({ aggregateRootType, aggregateRootId, command, data });
      }
      throw e;
    }
  };
}
