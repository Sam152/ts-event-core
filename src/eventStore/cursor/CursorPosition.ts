/**
 * If we consider a stream of events, a cursor position tracks a single
 * point in the stream. As the stream is processed, the cursor can be advanced
 * to keep track of where in the workload we are up to.
 */
export type CursorPosition = {
  /**
   * Positions can be considered to be "acquired", in the sense that some implementations
   * may choose to hold a lock on the position, to prevent multiple containers processing
   * a workload, which requires exactly-once processing.
   */
  acquire: () => Promise<number>;
  update: (position: number) => Promise<void>;
};
