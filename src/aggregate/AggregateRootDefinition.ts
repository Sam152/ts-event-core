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

/**
 * Typescript cannot define a record and infer the
 *
 * @see https://stackoverflow.com/questions/65343641
 */
export type AggregateRootDefinitionMapTypes = {
  [key: string]: {
    state: unknown;
    event: unknown;
  };
};
export type AggregateRootDefinitionMap<TTypeMap extends AggregateRootDefinitionMapTypes> = {
  [K in keyof TTypeMap]: AggregateRootDefinition<TTypeMap[K]["state"], TTypeMap[K]["event"]>;
};
