import { AggregateRootDefinition } from "@ts-event-core/framework";
import { passengerReducer } from "./reducer.ts";
import { notifyOfFlightDelay } from "./command/notifyOfFlightDelay.ts";

type EmailAddress = string;
type PhoneNumber = number;

export type PassengerState = {
  purchasedTickets: [];
  notificationPreferences: {
    type: "EMAIL";
    emailAddress: EmailAddress;
  } | {
    type: "SMS";
    phoneNumber: PhoneNumber;
  } | {
    type: "DO_NOT_CONTACT";
  };
};

export type PassengerEvent = {
  type: "TICKET_PURCHASED";
};

export const passengerAggregateRoot = {
  state: {
    version: 1,
    initialState: {
      purchasedTickets: [],
      notificationPreferences: {
        type: "DO_NOT_CONTACT",
      },
    },
    reducer: passengerReducer,
  },
  commands: {
    notifyOfFlightDelay,
  },
} satisfies AggregateRootDefinition<PassengerState, PassengerEvent>;
