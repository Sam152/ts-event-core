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

/**
 * Add `README.ts` to soft-wraps configuration before editing.
 */
export function README(): string {
  return `
    ts-event-core
    ====
    
    This project is an implementation of Event Sourcing, written TypeScript using a functional programming paradigm. It contains a set of loosely coupled types (and various implementations) which can be composed together.

    ----
    
    {{ index }}
    
    ----
    
    ## Domain
    
    ### Commands
    ### State
    ### Process manager
    
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
    
    ## Bootstraps
    
    ## Limitations, trade-offs & gaps
    
  `;
}
