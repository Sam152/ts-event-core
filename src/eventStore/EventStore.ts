export type EventStore<TEvent> = {
  /**
   * Persist events in the event store.
   *
   * @throws UniqueConstraintViolationError
   */
  persist: (events: EventEnvelope<TEvent>[]) => Promise<void>;

  /**
   * Retrieves events for the given aggregate type and ID, optionally from a specific version. Returns an
   * empty array, if none exist.
   */
  retrieve: (args: {
    aggregateType: string;
    aggregateId: string;
    fromVersion?: number;
  }) => Promise<EventEnvelope<TEvent>[]>;
};

export type EventEnvelope<TEvent> = {
  recordedAt: Date;
  aggregateType: string;
  aggregateId: string;
  aggregateVersion: number;
  event: TEvent;
};
