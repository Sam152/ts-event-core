import {
  AggregateRootDefinitionMap,
  AggregateRootDefinitionMapTypes,
} from "../aggregate/AggregateRootDefinition.ts";

/**
 * Events record statements of fact that occurred within a domain, while processing
 * commands. They are the single source of truth for all recorded data in the domain.
 */
export type Envelope<TEventPayload = unknown> = {
  aggregateRootType: string;
  aggregateRootId: string;
  aggregateVersion: number;
  recordedAt: Date;
  payload: TEventPayload;
};

export type EventStore<TEnvelope extends Envelope = Envelope> = {
  persist: (events: TEnvelope[]) => Promise<void>;
  retrieve: (args: {
    aggregateRootType: string;
    aggregateRootId: string;
    fromVersion?: number;
  }) => AsyncGenerator<TEnvelope>;
};

export type EventsRaisedByAggregateRoots<
  TAggregateRootDefinitionMap extends AggregateRootDefinitionMap<TAggregateMapTypes>,
  TAggregateMapTypes extends AggregateRootDefinitionMapTypes = AggregateRootDefinitionMapTypes,
> = Envelope<
  Parameters<
    TAggregateRootDefinitionMap[
      keyof TAggregateRootDefinitionMap
    ]["state"]["reducer"]
  >[1]
>;
