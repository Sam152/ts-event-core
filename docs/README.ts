import { documentType, linkType } from "./utils/documentType.ts";
import { EventStore } from "../src/eventStore/EventStore.ts";
import { documentFunction, linkFunction } from "./utils/documentCollapsedFunction.ts";
import { createInMemoryEventStore } from "../src/eventStore/createInMemoryEventStore.ts";
import { createPostgresEventStore } from "../src/eventStore/createPostgresEventStore.ts";
import { CommandIssuer } from "../src/command/CommandIssuer.ts";
import { AggregateRootRepository } from "../src/aggregate/AggregateRootRepository.ts";
import { createBasicAggregateRootRepository } from "../src/aggregate/repository/createBasicAggregateRootRepository.ts";
import {
  createSnapshottingAggregateRootRepository,
} from "../src/aggregate/repository/createSnapshottingAggregateRootRepository.ts";
import { Projector } from "../src/projection/Projector.ts";
import { createInMemorySnapshotStorage } from "../src/aggregate/snapshot/createInMemorySnapshotStorage.ts";
import { createPostgresSnapshotStorage } from "../src/aggregate/snapshot/createPostgresSnapshotStorage.ts";
import { createBasicCommandIssuer } from "../src/command/createBasicCommandIssuer.ts";
import { createQueuedCommandIssuer } from "../src/command/createQueuedCommandIssuer.ts";
import { SnapshotStorage } from "../src/aggregate/SnapshotStorage.ts";
import { createMemoryReducedProjector } from "../src/projection/createMemoryReducedProjector.ts";
import { documentConstWithCode } from "./utils/documentConst.ts";
import { flightAggregateRoot } from "../test/airlineDomain/aggregateRoot/flight/aggregateRoot.ts";
import { airlineAggregateRoots } from "../test/airlineDomain/index.ts";
import { lifetimeEarningsReport } from "../test/airlineDomain/projection/lifetimeEarningsReport.ts";
import { flightDelayProcessManager } from "../test/airlineDomain/processManager/flightDelayProcessManager.ts";
import { flightReducer } from "../test/airlineDomain/aggregateRoot/flight/reducer.ts";
import { purchaseTicket } from "../test/airlineDomain/aggregateRoot/flight/command/purchaseTicket.ts";
import { AirlineDomainBootstrap } from "../test/integration/bootstrap/AirlineDomainBootstrap.ts";

/**
 * Add `README.ts` to soft-wraps configuration before editing.
 */
export function README(): string {
  return `
    ts-event-core
    ====
    
    This project is an implementation of Event Sourcing, written in TypeScript using functional programming. It contains a set of loosely coupled components which can be interchanged and composed together.

    ----
    
    {{ index }}
    
    ----
    
    ## Example domain
    
    Our example domain comes from the airline industry. We've been tasked with figuring out how to notify passengers when flights are delayed. We've been given a few basic requirements:
    
    * We should be able to schedule flights.
    * Passengers can purchase tickets to those flights and set notification preferences on their account.
    * When flights are delayed, all ticket holders are sent either an SMS or email, depending on their preferences.

    We will start by defining our domain, then explore how its consumed by components of the framework.

    ### Aggregate roots
    
    ${documentConstWithCode(airlineAggregateRoots)}
    
    ${documentConstWithCode(flightAggregateRoot)}
    
    ### State
    
    ${documentFunction(flightReducer)}
    
    ### Commands
    
    ${documentConstWithCode(purchaseTicket)}
    
    ### Process manager
    
    ${documentFunction(flightDelayProcessManager)}
    
    ### Projections
    
    ${documentConstWithCode(lifetimeEarningsReport)}
    
    ### Bootstraps
    
    ${documentType<AirlineDomainBootstrap>()}
    
    ## Key framework components
    
    ### ${linkType<CommandIssuer<any, any>>()}
    
    ${documentType<CommandIssuer<any, any>>()}
    
    #### Implementations
    
    * ${linkFunction(createBasicCommandIssuer)}
    * ${linkFunction(createQueuedCommandIssuer)}
    
    ### ${linkType<AggregateRootRepository<any, any>>()}
    
    ${documentType<AggregateRootRepository<any, any>>()}
    
    #### Implementations
    
    * ${linkFunction(createBasicAggregateRootRepository)}
    * ${linkFunction(createSnapshottingAggregateRootRepository)}
    
    ### ${linkType<SnapshotStorage<any, any>>()}
    
    ${documentType<SnapshotStorage<any, any>>()}
    
    #### Implementations
    
    * ${linkFunction(createInMemorySnapshotStorage)} 
    * ${linkFunction(createPostgresSnapshotStorage)} 
    
    ### ${linkType<EventStore>()}
    
    ${documentType<EventStore>()}
    
    #### Implementations
    
    * ${linkFunction(createInMemoryEventStore)}
    * ${linkFunction(createPostgresEventStore)}

    ### ${linkType<Projector<any>>()}
    
    ${documentType<Projector<any>>()}
    
    #### Implementations
    
    * ${linkFunction(createMemoryReducedProjector)}
    
    ## Limitations, trade-offs & todos
    
    ## References and inspiration
    
  `;
}
