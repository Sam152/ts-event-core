import type { NotificationType, PassengerEvent, PassengerState } from "../aggregateRoot.ts";

export function notifyOfFlightDelay(
  passenger: PassengerState,
  { delayedUntil, flightNumber }: { flightNumber: string; delayedUntil: Date },
): PassengerEvent {
  const notification: NotificationType = {
    type: "DELAYED_FLIGHT",
    delayedUntil,
    flightNumber,
  };

  // We should never send a notification to a passenger if they don't hold a ticket for the given flight.
  if (!passenger.purchasedTickets.map((ticket) => ticket.flightNumber).includes(flightNumber)) {
    return {
      type: "NOTIFICATION_NOT_SENT",
      reason: "PASSENGER_NOT_ON_THE_GIVEN_FLIGHT",
      notification,
    };
  }

  switch (passenger.notificationPreference.type) {
    case "DO_NOT_CONTACT": {
      return {
        type: "NOTIFICATION_NOT_SENT",
        reason: "NOTIFICATION_PREFERENCE_WAS_DO_NOT_CONTACT",
        notification,
      };
    }
    case "SMS": {
      return {
        type: "SMS_NOTIFICATION_SENT",
        phoneNumber: passenger.notificationPreference.phoneNumber,
        notification,
      };
    }
    case "EMAIL": {
      return {
        type: "EMAIL_NOTIFICATION_SENT",
        emailAddress: passenger.notificationPreference.emailAddress,
        notification,
      };
    }
  }
}
