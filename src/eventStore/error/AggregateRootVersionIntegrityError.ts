/**
 * Thrown when the event store attempts to persist events, stemming from an aggregate
 * consistency error. That is, a command may have been acting on an aggregate that had
 * since been written to by another command.
 */
export class AggregateRootVersionIntegrityError extends Error {
  constructor() {
    super(
      "There was an integrity violation persisting events for an aggregate root, duplicate events exist for the same version.",
    );
    this.name = "AggregateVersionIntegrityError";
  }
}
