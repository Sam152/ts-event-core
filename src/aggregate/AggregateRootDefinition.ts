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
 * Typescript cannot define a record of generics, without additional inference
 * from a mapped type.
 *
 * @see https://stackoverflow.com/questions/65343641
 */
export type AggregateRootDefinitionMapTypes = Record<string, {
  state: any;
  event: any;
}>;
export type AggregateRootDefinitionMap<TTypeMap extends AggregateRootDefinitionMapTypes> = {
  [K in keyof TTypeMap]: AggregateRootDefinition<TTypeMap[K]["state"], TTypeMap[K]["event"]>;
};
