/**
 * A cursor position tracks a point in a  monotonically increasing sequence. This is useful for
 * processing workflows that are a function of an event stream. Components like reactors, process
 * managers and projections can use cursors to track positions within the stream.
 */
export type CursorPosition = {
  /**
   * A cursor positions are acquired, because acquisition happens in a locking fashion. That is
   * only a single instance of a cursor position can be acquired at any given moment. For persistent
   * cursors, this happens globally across all app containers, using the persistence mechanism for locking
   * and for memory based cursors, these are considered to be locked per app instance.
   */
  acquire: () => Promise<{
    position: number;
    update: (position: number) => Promise<void>;
  }>;
};
