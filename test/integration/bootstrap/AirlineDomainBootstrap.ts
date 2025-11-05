import { CommandIssuer } from "@ts-event-core/framework";
import { airlineAggregateRoots, LifetimeEarningsReport } from "@ts-event-core/airline-domain";

/**
 * To bootstrap a domain into a working application, key framework components need to be composed together with the
 * domain. All components have in-memory implementations, which allow for fast integration testing and persistent components
 * where applicable, which are more suited to production.
 *
 * The framework does not dictate the shape or properties of a bootstrap, but instead provides a library of underlying
 * components which should be composed together depending on the use case.
 *
 * The `event-sourcing-bootstrap.test.ts` test is a good reference for initializing an in-memory bootstrap and a production
 * bootstrap, both which pass the same test case, which begins with scheduling a flight:
 *
 * ```typescript
 * it("allows us to schedule a flight", async () => {
 *   await issueCommand({
 *     aggregateRootType: "FLIGHT",
 *     aggregateRootId: "SB93",
 *     command: "scheduleFlight",
 *     data: {
 *       departureTime: new Date("2035-01-01T05:00:00Z"),
 *       sellableSeats: 3,
 *     },
 *   });
 * });
 * ```
 *
 * ...and concludes asserting notifications were sent:
 *
 * ```typescript
 * it("ensures notifications are sent to affected passengers through the correct channel", async () => {
 *   await tryThing(() =>
 *     assertArrayIncludes(notificationLog, [
 *       "EMAIL: sam@example.com Flight delayed Hi, Flight SB93 has been delayed. Sorry about that.",
 *       "SMS: +61491570158 Uh-oh! Flight SB93 has been delayed... we're sorry :(",
 *     ])
 *   );
 * });
 * ```
 */
export type AirlineDomainBootstrap = {
  issueCommand: CommandIssuer<typeof airlineAggregateRoots>;
  notificationLog: string[];
  projections: {
    lifetimeEarnings: {
      data: LifetimeEarningsReport;
    };
  };
  start: () => Promise<void>;
  halt: () => Promise<void>;
};
