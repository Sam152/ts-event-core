import { NotificationType, PassengerEvent, PassengerState } from "../aggregateRoot.ts";

export function notifyOfFlightDelay(
  passenger: PassengerState,
  { delayedUntil, flightNumber }: { flightNumber: string; delayedUntil: Date },
): PassengerEvent {
  const notification: NotificationType = {
    type: "DELAYED_FLIGHT",
    delayedUntil,
    flightNumber,
  };

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
