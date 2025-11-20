import type { CursorPosition } from "./CursorPosition.ts";

/**
 * A memory cursor, where a lock is acquired once per cursor instance, per thread.
 */
export function createMemoryCursorPosition(): CursorPosition {
  let position = 0;
  let lock: Promise<void> = Promise.resolve();

  return {
    acquire: async () => {
      await lock;
      const { resolve, promise = lock } = Promise.withResolvers<void>();
      return {
        position,
        update: async (newPosition: number) => {
          position = newPosition;
          resolve();
        },
      };
    },
  };
}
