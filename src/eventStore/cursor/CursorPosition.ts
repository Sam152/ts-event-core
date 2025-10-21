/**
 * If we consider a stream of events, a cursor position tracks a single
 * point in the stream. As the stream is processed, the cursor can be advanced
 * to keep track of where in the workload we are up to.
 */
export type CursorPosition = {
  position: () => Promise<number>;
  update: (position: number) => Promise<void>;
};
