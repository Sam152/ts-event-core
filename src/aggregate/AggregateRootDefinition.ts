/**
 * An aggregate root definition, the state and commands used to power
 * writes in an event sourced system.
 */
export type AggregateRootDefinition<TAggregateRootState, TEvent> = {
  commands: CommandMap<TAggregateRootState, TEvent>;
  state: {
    initialState: TAggregateRootState;
    reducer: AggregateReducer<TAggregateRootState, TEvent>;
  };
};

export type AggregateReducer<TState, TEvent> = (state: TState, event: TEvent) => TState;

type CommandMap<TAggregateRootState, TEvent> = {
  [key: string]: <TCommandData extends never>(
      aggregate: TAggregateRootState,
      commandData: TCommandData,
  ) => TEvent | TEvent[];
};


export type AggregateRootDefinitionMap = Record<
  string,
  AggregateRootDefinition<
    any,
    any
  >
>;
