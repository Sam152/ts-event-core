/**
 * Events record statements of fact that occurred within a domain, while
 * processing a command.
 */
export type Event<TEventPayload = unknown> = {
  recordedAt: Date;
  aggregateType: string;
  aggregateId: string;
  aggregateVersion: number;
  payload: TEventPayload;
};

export type EventStore<TEvent extends Event> = {
  persist: (events: TEvent[]) => Promise<void>;
  retrieve: (args: {
    aggregateType: string;
    aggregateId: string;
    fromVersion?: number;
  }) => Promise<TEvent[]>;
};
