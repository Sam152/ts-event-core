/**
 * Events record statements of fact that occurred within a domain, while processing
 * commands. They are the single source of truth for all recorded data in the domain.
 */
export type Event<TEventPayload = unknown> = {
  recordedAt: Date;
  aggregateType: string;
  aggregateId: string;
  aggregateVersion: number;
  payload: TEventPayload;
};

export type EventStore<TEvent extends Event = Event> = {
  persist: (events: TEvent[]) => Promise<void>;
  retrieve: (args: {
    aggregateRootType: string;
    aggregateRootId: string;
    fromVersion?: number;
  }) => Promise<TEvent[]>;
};
