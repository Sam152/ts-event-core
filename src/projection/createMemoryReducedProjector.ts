import type { Projector } from "./Projector.ts";
import type { Event } from "../eventStore/EventStore.ts";

/**
 * Create a projection which uses a reducer and stores the resulting data in
 * memory.
 */
export function createMemoryReducedProjector<TEvent extends Event, TData>(
  { initialState, reducer }: {
    initialState: TData;
    reducer: (state: TData, event: TEvent) => TData;
  },
): {
  projector: Projector<TEvent>;
  data: TData;
} {
  const reducedProjector = {
    data: structuredClone(initialState),
    projector: (event: TEvent) => {
      reducedProjector.data = reducer(reducedProjector.data, event);
    },
  };
  return reducedProjector;
}
