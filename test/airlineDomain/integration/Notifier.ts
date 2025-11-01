export type Notifier = {
  sendSms: (args: { phoneNumber: number; message: string }) => Promise<void>;
  sendEmail: (args: { emailAddress: string; subject: string; body: string }) => Promise<void>;
};
