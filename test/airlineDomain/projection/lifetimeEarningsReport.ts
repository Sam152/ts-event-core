import { AirlineDomainEvent } from "@ts-event-core/airline-domain";

type LifetimeEarningsReport = {
  lifetimeEarningsCents: number;
};

export const lifetimeEarningsReport: {
  initialState: LifetimeEarningsReport;
  reducer: (state: LifetimeEarningsReport, event: AirlineDomainEvent) => LifetimeEarningsReport;
} = {
  initialState: {
    lifetimeEarningsCents: 0,
  },
  reducer: (state: LifetimeEarningsReport, event: AirlineDomainEvent) => {
    switch (event.payload.type) {
      case "TICKET_PURCHASED": {
        return {
          lifetimeEarningsCents: state.lifetimeEarningsCents + event.payload.purchasePrice.cents,
        };
      }
    }
    return state;
  },
};
