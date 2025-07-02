import { CommandIssuer } from "./CommandIssuer.ts";
import { AggregateDefinitionMap } from "../aggregate/AggregateDefinition.ts";
import { EventStore } from "../eventStore/EventStore.ts";

type CommandIssuerFactoryArgs<TAggregateMap extends AggregateDefinitionMap> = {
  eventStore: EventStore<unknown>;
  aggregates: TAggregateMap;
};

/**
 * A basic command issuer invokes and runs commands immediately.
 *
 * More sophisticated command issuers could inbox commands, implement retries or idempotency, etc.
 */
export function createBasicCommandIssuer<TAggregateMap extends AggregateDefinitionMap>(
  { eventStore, aggregates }: CommandIssuerFactoryArgs<TAggregateMap>,
): CommandIssuer<TAggregateMap> {
  // @todo

  return async ({ aggregateType, command, data }) => {
  };
}
