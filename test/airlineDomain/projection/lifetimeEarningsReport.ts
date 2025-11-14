import type { AirlineDomainEvent } from "@ts-event-core/airline-domain";

export type LifetimeEarningsReport = {
  lifetimeEarningsCents: number;
};

type LifetimeEarningsReportProjection = {
  initialState: LifetimeEarningsReport;
  reducer: (state: LifetimeEarningsReport, event: AirlineDomainEvent) => LifetimeEarningsReport;
};

/**
 * With our domain producing events, we can extract valuable insights from them. Projections (or read models) are
 * data structures built from our event store that can answer questions about our data or satisfy certain access
 * patterns.
 *
 * In this case, we've been tasked with producing a lifetime earnings report, summing the purchase price of all tickets
 * ever sold. Like our decision model, this is also structured as a reducer, but there is no hard requirement for where this
 * data is stored or how the data structure is built.
 */
export const lifetimeEarningsReport: LifetimeEarningsReportProjection = {
  initialState: {
    lifetimeEarningsCents: 0,
  },
  reducer: (state: LifetimeEarningsReport, event: AirlineDomainEvent) => ({
    lifetimeEarningsCents: state.lifetimeEarningsCents +
      (event.payload.type === "TICKET_PURCHASED" ? event.payload.purchasePrice.cents : 0),
  }),
};
