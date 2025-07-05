/**
 * Events record statements of fact that occur while commands are
 * processing.
 */
export type Event<TEventPayload = unknown> = {
  recordedAt: Date;
  aggregateType: string;
  aggregateId: string;
  aggregateVersion: number;
  payload: TEventPayload;
};

export type EventStore<TEvent extends Event> = {
  /**
   * Persist events in the event store.
   */
  persist: (events: TEvent[]) => Promise<void>;

  /**
   * Retrieves events for the given aggregate type and ID, optionally from a specific version. Returns an
   * empty array, if none exist.
   */
  retrieve: (args: {
    aggregateType: string;
    aggregateId: string;
    fromVersion?: number;
  }) => Promise<TEvent[]>;
};
