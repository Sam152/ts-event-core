import { PassengerEvent, PassengerState } from "../aggregateRoot.ts";

export function setNotificationPreference(
  _passenger: PassengerState,
  data: { emailAddress: string } | {
    phoneNumber: string;
  },
): PassengerEvent {
  if ("emailAddress" in data) {
    return {
      type: "NOTIFICATION_PREFERENCE_SET",
      preference: "EMAIL",
      emailAddress: data.emailAddress,
    };
  }
  return {
    type: "NOTIFICATION_PREFERENCE_SET",
    preference: "SMS",
    phoneNumber: data.phoneNumber,
  };
}
