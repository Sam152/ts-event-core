export type AggregateReducer<TState, TEvent> = (state: TState, event: TEvent) => TState;

export type AggregateDefinition<TAggregateRootState, TEvent> = {
  aggregateTypeId: string;
  reduce: AggregateReducer<TAggregateRootState, TEvent>;
  commands: {
    [key: string]: (aggregate: TAggregateRootState, commandData: never) => TEvent | TEvent[];
  };
};
