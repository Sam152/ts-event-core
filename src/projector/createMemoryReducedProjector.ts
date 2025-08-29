import { Projector } from "./Projector.ts";
import { Event } from "../eventStore/EventStore.ts";

/**
 * Create a projector which uses a reducer and stores the resulting data in
 * memory.
 */
export function createMemoryReducedProjector<TEvent extends Event, TState>(
  {initialState, reducer}: {
    initialState: TState;
    reducer: (state: TState, event: TEvent) => TState;
  },
): {
  projector: Projector<TEvent>;
  data: TState;
} {
  const reducedProjector = {
    data: initialState,
    projector: (event: TEvent) => {
      reducedProjector.data = reducer(reducedProjector.data, event);
    },
  };
  return reducedProjector;
}
