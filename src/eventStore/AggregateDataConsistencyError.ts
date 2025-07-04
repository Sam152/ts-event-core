/**
 * Thrown when the event store attempts to persist events, stemming from an aggregate
 * consistency error. That is, a command may have been acting on an aggregate that had
 * since been written to by another command.
 */
export class AggregateDataConsistencyError extends Error {
  constructor() {
    super("Encountered an aggregate data consistency error while persisting events");
    this.name = "AggregateDataConsistencyError";
  }
}
