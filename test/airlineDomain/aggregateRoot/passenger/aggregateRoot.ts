import type { AggregateRootDefinition } from "@ts-event-core/framework";
import { passengerReducer } from "./reducer.ts";
import { notifyOfFlightDelay } from "./command/notifyOfFlightDelay.ts";
import { addTicketToAccount } from "./command/addTicketToAccount.ts";
import { setNotificationPreference } from "./command/setNotificationPreference.ts";

export type PassengerState = {
  purchasedTickets: {
    flightNumber: string;
  }[];
  notificationPreference: {
    type: "EMAIL";
    emailAddress: string;
  } | {
    type: "SMS";
    phoneNumber: string;
  } | {
    type: "DO_NOT_CONTACT";
  };
};

export type PassengerEvent =
  | {
    type:
      | "ADD_TICKET_TO_ACCOUNT_FAILED"
      | "SET_NOTIFICATION_PREFERENCE_FAILED";
    reason: string;
  }
  | {
    type: "TICKET_ADDED_TO_ACCOUNT";
    flightNumber: string;
  }
  | {
    type: "NOTIFICATION_PREFERENCE_SET";
  }
    & ({
      preference: "EMAIL";
      emailAddress: string;
    } | {
      preference: "SMS";
      phoneNumber: string;
    })
  | {
    type: "NOTIFICATION_NOT_SENT";
    reason: string;
    notification: NotificationType;
  }
  | {
    type: "SMS_NOTIFICATION_SENT";
    phoneNumber: string;
    notification: NotificationType;
  }
  | {
    type: "EMAIL_NOTIFICATION_SENT";
    emailAddress: string;
    notification: NotificationType;
  };

export type NotificationType = {
  type: "DELAYED_FLIGHT";
  delayedUntil: Date;
  flightNumber: string;
};

export const passengerAggregateRoot = {
  state: {
    version: 1,
    initialState: {
      purchasedTickets: [],
      notificationPreference: {
        type: "DO_NOT_CONTACT",
      },
    },
    reducer: passengerReducer,
  },
  commands: {
    notifyOfFlightDelay,
    addTicketToAccount,
    setNotificationPreference,
  },
} satisfies AggregateRootDefinition<PassengerState, PassengerEvent>;
