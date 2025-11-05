import { AirlineDomainEvent } from "../index.ts";
import { Notifier } from "./Notifier.ts";

/**
 * Treats the event store as an outbox for sending notifications.
 */
export async function notificationOutbox(
  { event, notifier }: {
    event: AirlineDomainEvent;
    notifier: Notifier;
  },
) {
  if (event.payload.type === "SMS_NOTIFICATION_SENT") {
    switch (event.payload.notification.type) {
      case "DELAYED_FLIGHT":
        await notifier.sendSms({
          phoneNumber: event.payload.phoneNumber,
          message:
            `Uh-oh! Flight ${event.payload.notification.flightNumber} has been delayed... we're sorry :(`,
        });
    }
  }
  if (event.payload.type === "EMAIL_NOTIFICATION_SENT") {
    switch (event.payload.notification.type) {
      case "DELAYED_FLIGHT":
        await notifier.sendEmail({
          emailAddress: event.payload.emailAddress,
          subject: "Flight delayed",
          body: `Hi, Flight ${event.payload.notification.flightNumber} has been delayed. Sorry about that.`,
        });
    }
  }
}
