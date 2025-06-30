export type AggregateReducer<TState, TEvent> = (state: TState, event: TEvent) => TState;

type CommandMap<TAggregateRootState, TEvent> = {
  [key: string]: <TCommandData extends never>(
    aggregate: TAggregateRootState,
    commandData: TCommandData,
  ) => TEvent | TEvent[];
};

export type AggregateDefinition<TAggregateRootState, TEvent> = {
  aggregateTypeId: string;
  reduce: AggregateReducer<TAggregateRootState, TEvent>;
  commands: CommandMap<TAggregateRootState, TEvent>;
};
