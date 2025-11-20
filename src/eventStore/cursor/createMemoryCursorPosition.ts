import type { CursorPosition } from "./CursorPosition.ts";

/**
 * A memory cursor, where a lock is acquired once per cursor instance, per thread.
 */
export function createMemoryCursorPosition(): CursorPosition {
  let position = 0n;
  let lock: Promise<void> = Promise.resolve();

  return {
    acquire: async () => {
      const currentLock = lock;
      const { resolve, promise } = Promise.withResolvers<void>();
      lock = promise;

      await currentLock;

      return {
        position,
        update: async (newPosition: bigint) => {
          position = newPosition;
          resolve();
        },
      };
    },
  };
}
