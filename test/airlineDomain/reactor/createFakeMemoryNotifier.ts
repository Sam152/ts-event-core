import type { Notifier } from "./notificationsReactor.ts";

export function createFakeMemoryNotifier(): { notifier: Notifier; log: string[] } {
  const log: string[] = [];
  return {
    log,
    notifier: {
      sendEmail: async ({ emailAddress, subject, body }) => {
        log.push(`EMAIL: ${emailAddress} ${subject} ${body}`);
      },
      sendSms: async ({ phoneNumber, message }) => {
        log.push(`SMS: ${phoneNumber} ${message}`);
      },
    },
  };
}
