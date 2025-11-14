import type { PassengerEvent, PassengerState } from "./aggregateRoot.ts";

export function passengerReducer(state: PassengerState, event: PassengerEvent): PassengerState {
  switch (event.type) {
    case "TICKET_ADDED_TO_ACCOUNT": {
      return {
        ...state,
        purchasedTickets: [...state.purchasedTickets, {
          flightNumber: event.flightNumber,
        }],
      };
    }
    case "NOTIFICATION_PREFERENCE_SET": {
      if (event.preference === "SMS") {
        return {
          ...state,
          notificationPreference: {
            type: "SMS",
            phoneNumber: event.phoneNumber,
          },
        };
      }
      if (event.preference === "EMAIL") {
        return {
          ...state,
          notificationPreference: {
            type: "EMAIL",
            emailAddress: event.emailAddress,
          },
        };
      }
    }
  }

  return state;
}
