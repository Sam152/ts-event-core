import { AirlineDomainEvent } from "../index.ts";

/**
 * Treats the event store as an outbox for sending notifications.
 */
export async function notificationOutbox(
  { event }: {
    event: AirlineDomainEvent;
  },
) {
}
