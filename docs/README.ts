import { documentType, linkType } from "./utils/documentType.ts";
import { EventStore } from "../src/eventStore/EventStore.ts";
import { linkFunction } from "./utils/documentFunction.ts";
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

/**
 * Add `README.ts` to soft-wraps configuration before editing.
 */
export function README(): string {
  return `
    ts-event-core
    ====
    
    This project is an implementation of Event Sourcing, written in TypeScript using functional programming techniques. It contains a set of loosely coupled components which can be composed together and an example domain demonstrating how they can be used.

    ----
    
    {{ index }}
    
    ----
    
    ## Example domain
    
    ### Aggregate roots
    
    ${documentConstWithCode(airlineAggregateRoots)}
    
    ${documentConstWithCode(flightAggregateRoot)}
    
    ### Commands
    ### State
    ### Process manager
    ### Bootstraps
    
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
