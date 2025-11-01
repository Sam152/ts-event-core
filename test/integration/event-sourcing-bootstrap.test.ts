import { afterAll, beforeAll, it } from "@std/testing/bdd";
import { bootstrapInMemory } from "./bootstrap/bootstrapInMemory.ts";
import { bootstrapProduction } from "./bootstrap/bootstrapProduction.ts";
import { prepareTestDatabaseContainer } from "./utils/prepareTestDatabaseContainer.ts";
import { describeAll } from "./utils/describeAll.ts";
import { assertEquals } from "@std/assert";
import { purchaseTicket } from "../airlineDomain/aggregateRoot/flight/command/purchaseTicket.ts";
import {
  setNotificationPreference,
} from "../airlineDomain/aggregateRoot/passenger/command/setNotificationPreference.ts";
import { tryThing } from "./utils/tryThing.ts";
import { assertArrayIncludes } from "@std/assert/array-includes";

const implementations = [
  {
    bootstrapFn: bootstrapInMemory,
    beforeAllHook: () => undefined,
  },
  {
    bootstrapFn: bootstrapProduction,
    beforeAllHook: prepareTestDatabaseContainer,
  },
];

describeAll(
  "event sourcing bootstrap",
  implementations,
  ({ bootstrapFn, beforeAllHook }) => {
    const { issueCommand, projections, notificationLog, ...bootstrap } = bootstrapFn();

    beforeAll(beforeAllHook);
    beforeAll(bootstrap.start);
    afterAll(bootstrap.halt);

    it("allows us to schedule a flight", async () => {
      await issueCommand({
        aggregateRootType: "FLIGHT",
        aggregateRootId: "SB93",
        command: "scheduleFlight",
        data: {
          departureTime: new Date("2035-01-01T05:00:00Z"),
          sellableSeats: 3,
        },
      });
    });

    it("allows all 3 of the available tickets to be purchased", async () => {
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
    });

    it("will not allow a 4th ticket to be purchased", async () => {
      await issuePurchaseTicket({
        passengerId: "PA_4444444",
        purchasePriceAudCents: 300_00,
      });
    });

    it("projects a read model of our lifetime earnings", async () => {
      await tryThing(() =>
        assertEquals(projections.lifetimeEarnings.data, {
          lifetimeEarningsCents: 415_00,
        })
      );
    });

    it("allows notification preferences to be set", async () => {
      await issueSetNotificationPreference("PA_1111111", {
        emailAddress: "sam@example.com",
      });
      await issueSetNotificationPreference("PA_3333333", {
        phoneNumber: "+61491570158",
      });
      // Jeff can set his notification preferences, despite not having successfully
      // booked a ticket.
      await issueSetNotificationPreference("PA_4444444", {
        emailAddress: "jeff@example.com",
      });
    });

    it("allows a flight to be delayed", async () => {
      await issueCommand({
        aggregateRootType: "FLIGHT",
        aggregateRootId: "SB93",
        command: "delayFlight",
        data: {
          delayedUntil: new Date("2035-01-01"),
        },
      });
    });

    it("ensures notifications are sent to affected passengers through the correct channel", async () => {
      await tryThing(() =>
        assertArrayIncludes(notificationLog, [
          "EMAIL: sam@example.com Flight delayed Hi, Flight SB93 has been delayed. Sorry about that.",
          "SMS: +61491570158 Uh-oh! Flight SB93 has been delayed... we're sorry :(",
        ])
      );
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
