import { CommandIssuer } from "./CommandIssuer.ts";
import { AggregateDefinitionMap } from "../aggregate/AggregateDefinition.ts";
import { Event, EventStore } from "../eventStore/EventStore.ts";

type CommandIssuerFactoryArgs<
  TAggregateMap extends AggregateDefinitionMap,
  TEventType extends Event<unknown>,
> = {
  eventStore: EventStore<TEventType>;
  aggregates: TAggregateMap;
};

/**
 * A basic command issuer invokes and runs commands immediately.
 *
 * More sophisticated command issuers could inbox commands, implement retries or idempotency, etc.
 */
export function createBasicCommandIssuer<
  TAggregateMap extends AggregateDefinitionMap,
  TEventType extends Event<unknown>,
>(
  { eventStore, aggregates }: CommandIssuerFactoryArgs<TAggregateMap, TEventType>,
): CommandIssuer<TAggregateMap> {
  // @todo

  return async ({ aggregateType, command, data }) => {
  };
}
