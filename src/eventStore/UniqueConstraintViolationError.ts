/**
 * Thrown when the event store attempts to persist events, with a unique constraint violation.
 */
export class UniqueConstraintViolationError extends Error {
  constructor() {
    super("Encountered a UniqueConstraintViolationError while persisting events");
    this.name = "UniqueConstraintViolationError";
  }
}
