import { it } from "@std/testing/bdd";
import { bootstrapInMemory } from "./bootstrap/bootstrapInMemory.ts";
import { bootstrapProduction } from "./bootstrap/bootstrapProduction.ts";
import { beforeEach } from "@std/testing/bdd";
import { prepareTestDatabaseContainer } from "./utils/prepareTestDatabaseContainer.ts";
import { describeAll } from "./utils/describeAll.ts";
import { wait } from "./utils/wait.ts";
import { assertEquals } from "@std/assert";
import { faker } from "@faker-js/faker";
import { purchaseTicket } from "../airlineDomain/aggregateRoot/flight/command/purchaseTicket.ts";
import {
  setNotificationPreference,
} from "../airlineDomain/aggregateRoot/passenger/command/setNotificationPreference.ts";

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
    beforeEach(beforeEachHook);
    beforeEach(() => {
      faker.seed(912818212);
    });

    it("bootstraps a configuration of the event sourcing system", async () => {
      const { issueCommand, projections, ...bootstrap } = bootstrapFn();
      await bootstrap.start();

      // Schedule a flight.
      await issueCommand({
        aggregateRootType: "FLIGHT",
        aggregateRootId: "SB93",
        command: "scheduleFlight",
        data: {
          departureTime: new Date("2035-01-01"),
          sellableSeats: 3,
        },
      });

      const issuePurchaseTicket = (data: Parameters<typeof purchaseTicket>[1]) =>
        issueCommand({
          aggregateRootType: "FLIGHT",
          aggregateRootId: "SB93",
          command: "purchaseTicket",
          data,
        });

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

      // @TODO fix re-issue.
      await wait(1000);

      await issueSetNotificationPreference("PA_1111111", {
        emailAddress: "sam@example.com",
      });
      await issueSetNotificationPreference("PA_3333333", {
        phoneNumber: 99999999,
      });
      // Jeff can set his notification preferences, but since he wont be on the flight, we shouldn't
      // expect him to get a message.
      await issueSetNotificationPreference("PA_4444444", {
        emailAddress: "jeff@example.com",
      });

      // TODO, delay the flight, assert messages were sent.

      await wait(5000);

      assertEquals(projections.lifetimeEarnings.data, {
        lifetimeEarningsCents: 415_00,
      });

      await bootstrap.halt();
    });
  },
);
