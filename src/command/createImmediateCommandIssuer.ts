import { CommandIssuer } from "./CommandIssuer.ts";
import { AggregateDefinitionMap } from "../aggregate/AggregateDefinition.ts";
import { Event, EventStore } from "../eventStore/EventStore.ts";

/**
 * An immediate command issuer processes commands right away. This is in contrast to other kinds
 * of command buses which may acknowledge commands, to be processed later.
 */
export function createImmediateCommandIssuer<
  TAggregateMap extends AggregateDefinitionMap,
  TEventType extends Event,
>(
  { eventStore, aggregateRoots }: {
    eventStore: EventStore<TEventType>;
    aggregateRoots: TAggregateMap;
  },
): CommandIssuer<TAggregateMap> {
  // @todo

  return async ({ aggregateType, command, data }) => {
  };
}
