import {
  AggregateRootDefinitionMap,
  AggregateRootDefinitionMapTypes,
} from "../aggregate/AggregateRootDefinition.ts";

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
  }) => AsyncGenerator<TEvent>;

  retrieveAll: (args: {
    idGt: number;
    limit: number;
  }) => AsyncGenerator<TEvent>;
};

export type EventsRaisedByAggregateRoots<
  TAggregateRootDefinitionMap extends AggregateRootDefinitionMap<TAggregateMapTypes>,
  TAggregateMapTypes extends AggregateRootDefinitionMapTypes = AggregateRootDefinitionMapTypes,
> = Event<
  Parameters<
    TAggregateRootDefinitionMap[
      keyof TAggregateRootDefinitionMap
    ]["state"]["reducer"]
  >[1]
>;
