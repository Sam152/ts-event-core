import { CommandIssuer } from "@ts-event-core/framework";
import { airlineAggregateRoots, LifetimeEarningsReport } from "@ts-event-core/airline-domain";

/**
 * A bootstrap of the flight tracking domain. This object combines components of the
 * framework with the domain and provides an interface between them.
 *
 * Consumers of the framework are expected to understand each of the components, combine
 * them in a way that sensible for their use case and integrate their own domain.
 *
 * The domain code is ultimately a series of pure functions, which could be independently
 * shipped and integrated into different contexts, but is defined in a way here which
 * smoothly integrates with the framework components.
 */
export type AirlineDomainBootstrap = {
  issueCommand: CommandIssuer<typeof airlineAggregateRoots>;
  projections: {
    lifetimeEarnings: {
      data: LifetimeEarningsReport;
    };
  };
  start: () => Promise<void>;
  halt: () => Promise<void>;
};
