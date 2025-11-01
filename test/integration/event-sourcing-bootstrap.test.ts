import { beforeAll, it } from "@std/testing/bdd";
import { bootstrapInMemory } from "./bootstrap/bootstrapInMemory.ts";
import { bootstrapProduction } from "./bootstrap/bootstrapProduction.ts";
import { prepareTestDatabaseContainer } from "./utils/prepareTestDatabaseContainer.ts";
import { describeAll } from "./utils/describeAll.ts";

import { assertEquals } from "@std/assert";

import { purchaseTicket } from "../airlineDomain/aggregateRoot/flight/command/purchaseTicket.ts";
import {
  setNotificationPreference,
} from "../airlineDomain/aggregateRoot/passenger/command/setNotificationPreference.ts";
import { wait } from "./utils/wait.ts";

const implementations = [
  {
    bootstrapFn: bootstrapInMemory,
    beforeEachHook: () => undefined,
  },
  {
    bootstrapFn: bootstrapProduction,
    beforeEachHook: prepareTestDatabaseContainer,
  },
];

describeAll(
  "event sourcing bootstrap",
  implementations,
  ({ bootstrapFn, beforeEachHook }) => {
    beforeAll(beforeEachHook);
    const { issueCommand, projections, ...bootstrap } = bootstrapFn();

    it("bootstraps a configuration of the event sourcing system", async () => {
      await bootstrap.start();

      // Schedule a flight.
      await issueCommand({
        aggregateRootType: "FLIGHT",
        aggregateRootId: "SB93",
        command: "scheduleFlight",
        data: {
          departureTime: new Date("2035-01-01T05:00:00Z"),
          sellableSeats: 3,
        },
      });

      // Try buy 4 of the 3 available tickets.
      await issuePurchaseTicket({
        passengerId: "PA_1111111",
        purchasePriceAudCents: 110_00,
      });
      await issuePurchaseTicket({
        passengerId: "PA_2222222",
        purchasePriceAudCents: 220_00,
      });
      await issuePurchaseTicket({
        passengerId: "PA_3333333",
        purchasePriceAudCents: 85_00,
      });
      // This purchase will fail, since we can only sell 3 seats.
      await issuePurchaseTicket({
        passengerId: "PA_4444444",
        purchasePriceAudCents: 300_00,
      });

      await issueSetNotificationPreference("PA_1111111", {
        emailAddress: "sam@example.com",
      });
      await issueSetNotificationPreference("PA_3333333", {
        phoneNumber: "+61491570158",
      });
      // Jeff can set his notification preferences, but since they don't have a ticket,
      // the notification is not relevant to them.
      await issueSetNotificationPreference("PA_4444444", {
        emailAddress: "jeff@example.com",
      });

      // Uh oh there was a flight delay.
      await issueCommand({
        aggregateRootType: "FLIGHT",
        aggregateRootId: "SB93",
        command: "delayFlight",
        data: {
          delayedUntil: new Date("2035-01-01"),
        },
      });

      await wait(1000);

      // Our projection will give us lifetime earnings from our three ticket sales.
      assertEquals(projections.lifetimeEarnings.data, {
        lifetimeEarningsCents: 415_00,
      });

      await bootstrap.halt();
    });

    const issuePurchaseTicket = (data: Parameters<typeof purchaseTicket>[1]) =>
      issueCommand({
        aggregateRootType: "FLIGHT",
        aggregateRootId: "SB93",
        command: "purchaseTicket",
        data,
      });

    const issueSetNotificationPreference = (
      aggregateRootId: string,
      data: Parameters<typeof setNotificationPreference>[1],
    ) =>
      issueCommand({
        aggregateRootType: "PASSENGER",
        aggregateRootId,
        command: "setNotificationPreference",
        data,
      });
  },
);
