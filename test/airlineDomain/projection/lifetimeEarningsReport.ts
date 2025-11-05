import { AirlineDomainEvent } from "@ts-event-core/airline-domain";

export type LifetimeEarningsReport = {
  lifetimeEarningsCents: number;
};

export const lifetimeEarningsReport: {
  initialState: LifetimeEarningsReport;
  reducer: (state: LifetimeEarningsReport, event: AirlineDomainEvent) => LifetimeEarningsReport;
} = {
  initialState: {
    lifetimeEarningsCents: 0,
  },
  reducer: (state: LifetimeEarningsReport, event: AirlineDomainEvent) => ({
    lifetimeEarningsCents: state.lifetimeEarningsCents +
      (event.payload.type === "TICKET_PURCHASED" ? event.payload.purchasePrice.cents : 0),
  }),
};
