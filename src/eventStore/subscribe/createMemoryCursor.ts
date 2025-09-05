import { Cursor } from "./Cursor.ts";

/**
 * A memory cursor is useful for testing, or use cases where starting
 * a container some processing of the entire event store.
 */
export function createMemoryCursor(): Cursor {
  let positionStorage = 0;
  return {
    position: async () => positionStorage,
    update: async (position) => {
      positionStorage = position;
    },
  };
}
