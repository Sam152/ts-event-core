export async function reduceGenerator<TItem, TState>(
  generator: AsyncGenerator<TItem>,
  reducer: (state: TState, item: TItem) => TState,
  initialState: TState,
): Promise<TState> {
  let value = initialState;

  for await (const item of generator) {
    value = reducer(value, item);
  }

  return value;
}
