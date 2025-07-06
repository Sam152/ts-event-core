import { Commander } from "../Commander.ts";
import { Event, EventStore } from "../../eventStore/EventStore.ts";
import { AggregateRootDefinitionMap } from "../../aggregate/AggregateRootDefinition.ts";
import { AggregateRootRepository } from "../../aggregate/AggregateRootRepository.ts";

/**
 * An immediate command issuer processes commands right away. This is in contrast to other kinds
 * of command buses which may acknowledge commands, to be processed later.
 */
export function createImmediateCommandIssuer<
  TAggregateMap extends AggregateRootDefinitionMap,
  TEventType extends Event,
>(
  { aggregateRootRepository, aggregateRoots }: {
    eventStore: EventStore<TEventType>;
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
    const commandResult = commandMap[command as keyof typeof commandMap](aggregate.state, data);

    await aggregateRootRepository.persist({
      aggregate,
      pendingEvents: Array.isArray(commandResult) ? commandResult : [commandResult],
    });
  };
}
