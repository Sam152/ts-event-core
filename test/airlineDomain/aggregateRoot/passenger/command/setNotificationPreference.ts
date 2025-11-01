import { PassengerEvent, PassengerState } from "../aggregateRoot.ts";

export function setEmailNotificationPreference(
  passenger: PassengerState,
  { emailAddress }: { emailAddress: string },
): PassengerEvent {
  return {
    type: "NOTIFICATION_PREFERENCE_SET",
    preference: "EMAIL",
    emailAddress,
  };
}
