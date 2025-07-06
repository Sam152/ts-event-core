import { Event } from "../eventStore/EventStore.ts";

export type AggregateReducer<TState, TEvent> = (event: TEvent, state: TState) => TState;

type CommandMap<TAggregateRootState, TEvent> = {
  [key: string]: <TCommandData extends never>(
    aggregate: TAggregateRootState,
    commandData: TCommandData,
  ) => TEvent | TEvent[];
};

export type AggregateRootDefinition<TAggregateRootState = any, TEvent = any> = {
  commands: CommandMap<TAggregateRootState, TEvent>;
  state: {
    initialState: TAggregateRootState;
    reducer: AggregateReducer<TAggregateRootState, TEvent>;
  };
};

export type AggregateRootDefinitionMap = Record<string, AggregateRootDefinition>;

export type EventsRaisedByAggregateRoots<TAggregateRootDefinitionMap extends AggregateRootDefinitionMap> =
  Event<
    Parameters<
      TAggregateRootDefinitionMap[
        keyof TAggregateRootDefinitionMap
      ]["state"]["reducer"]
    >[1]
  >;
