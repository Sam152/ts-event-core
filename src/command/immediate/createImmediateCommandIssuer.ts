import { Commander } from "../Commander.ts";
import { Event, EventStore } from "../../eventStore/EventStore.ts";
import { AggregateRootDefinitionMap } from "../../aggregate/AggregateRootDefinition.ts";

/**
 * An immediate command issuer processes commands right away. This is in contrast to other kinds
 * of command buses which may acknowledge commands, to be processed later.
 */
export function createImmediateCommandIssuer<
  TAggregateMap extends AggregateRootDefinitionMap,
  TEventType extends Event,
>(
  { eventStore, aggregateRoots }: {
    eventStore: EventStore<TEventType>;
    aggregateRoots: TAggregateMap;
  },
): Commander<TAggregateMap> {
  // @todo

  return async ({ aggregateType, command, data }) => {
  };
}
