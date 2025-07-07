import { AggregateRootDefinitionMap, AggregateRootDefinitionMapTypes, } from "../aggregate/AggregateRootDefinition.ts";

/**
 * Events record statements of fact that occurred within a domain, while processing
 * commands. They are the single source of truth for all recorded data in the domain.
 */
export type Event<TEventPayload = unknown> = {
  aggregateRootType: string;
  aggregateRootId: string;
  aggregateVersion: number;
  recordedAt: Date;
  payload: TEventPayload;
};

export type EventStore<TEvent extends Event = Event> = {
  persist: (events: TEvent[]) => Promise<void>;
  retrieve: (args: {
    aggregateRootType: string;
    aggregateRootId: string;
    fromVersion?: number;
  }) => Promise<TEvent[]>;
};

export type EventsRaisedByAggregateRoots<
  TAggregateMapTypes extends AggregateRootDefinitionMapTypes,
  TAggregateRootDefinitionMap extends AggregateRootDefinitionMap<TAggregateMapTypes>,
> = Event<
  Parameters<
    TAggregateRootDefinitionMap[
      keyof TAggregateRootDefinitionMap
    ]["state"]["reducer"]
  >[1]
>;
