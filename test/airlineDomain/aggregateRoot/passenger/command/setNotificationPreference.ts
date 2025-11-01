import { PassengerEvent, PassengerState } from "../aggregateRoot.ts";

export function setNotificationPreference(
  _passenger: PassengerState,
  { emailAddress, phoneNumber }: { emailAddress: string; phoneNumber: undefined } | {
    emailAddress: undefined;
    phoneNumber: number;
  },
): PassengerEvent {
  if (emailAddress !== undefined) {
    return {
      type: "NOTIFICATION_PREFERENCE_SET",
      preference: "EMAIL",
      emailAddress,
    };
  }
  return {
    type: "NOTIFICATION_PREFERENCE_SET",
    preference: "SMS",
    phoneNumber,
  };
}
