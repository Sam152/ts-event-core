/**
 * An aggregate root definition, the state and commands used to power
 * writes in an event sourced system.
 */
export type AggregateRootDefinition<TAggregateRootState, TEvent> = {
  commands: CommandMap<TAggregateRootState, TEvent>;
  state: {
    reducer: AggregateReducer<TAggregateRootState, TEvent>;
    initialState: TAggregateRootState;

    /**
     * Reducers can change, so when state is reduced and persisted, by way of a snapshot, we need to be able to
     * identify a version of the state.
     */
    version: AggregateStateVersion;
  };
};

export type AggregateStateVersion = string | number;

export type AggregateReducer<TState, TEvent> = (state: TState, event: TEvent) => TState;

type CommandMap<TAggregateRootState, TEvent> = {
  [key: string]: <TCommandData extends never>(
    aggregate: TAggregateRootState,
    commandData: TCommandData,
  ) => TEvent | TEvent[];
};

/**
 * Typescript cannot define a record of generics, without additional inference
 * from a mapped type. When used as a generic, this type infers all the TState and
 * TEvent types used in a map, then keys them off into definitions via the
 * AggregateRootDefinitionMap type.
 *
 * An alternative is to define AggregateRootDefinitionMap as
 * Record<string, AggregateRootDefinition<any, any>>, which seems to maintain fine
 * type safety for callers, but this means internally the library has to contend
 * with `any`.
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
