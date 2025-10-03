import { documentType } from "./utils/documentType.ts";
import { EventStore } from "../src/eventStore/EventStore.ts";
import { documentFunction } from "./utils/documentFunction.ts";
import { createInMemoryEventStore } from "../src/eventStore/createInMemoryEventStore.ts";
import { createPostgresEventStore } from "../src/eventStore/createPostgresEventStore.ts";
import { AggregateRootDefinition } from "../src/aggregate/AggregateRootDefinition.ts";
import { CommandIssuer } from "../src/command/CommandIssuer.ts";
import { AggregateRootRepository } from "../src/aggregate/AggregateRootRepository.ts";
import { createBasicAggregateRootRepository } from "../src/aggregate/repository/createBasicAggregateRootRepository.ts";
import {
  createSnapshottingAggregateRootRepository,
} from "../src/aggregate/repository/createSnapshottingAggregateRootRepository.ts";
import { Projector } from "../src/projector/Projector.ts";
import { createInMemorySnapshotStorage } from "../src/aggregate/snapshot/createInMemorySnapshotStorage.ts";
import { createPostgresSnapshotStorage } from "../src/aggregate/snapshot/createPostgresSnapshotStorage.ts";

/**
 * Edit with soft-wrap enabled.
 */
export function README(): string {
  return `
    ts-event-core
    ====
    
    This project is an implementation of Event Sourcing, written TypeScript using a functional programming paradigm.
    
    It contains a set of loosely coupled types (and various implementations of these types) which can be composed and interchanged.

    ----
    
    {{ index }}
    
    ----
    
    ## Aggregate root definition
    
    ${documentType<AggregateRootDefinition<any, any>>()}
    
    ## Commander
    
    ${documentType<CommandIssuer<any, any>>()}
    
    ## Aggregate root repository
    
    ${documentType<AggregateRootRepository<any, any>>()}
    
    ### Basic
    
    ${documentFunction(createBasicAggregateRootRepository)}
    
    ### Snapshotting
    
    ${documentFunction(createSnapshottingAggregateRootRepository)}
    
    #### In-memory
    
    ${documentFunction(createInMemorySnapshotStorage)}
    
    #### Postgres
    
    ${documentFunction(createPostgresSnapshotStorage)}
    
    ## Event store
    
    ${documentType<EventStore>()}
    
    ### In-memory
    
    ${documentFunction(createInMemoryEventStore)}
    
    ### Postgres
    
    ${documentFunction(createPostgresEventStore)}
 
    ## Projector
    
    ${documentType<Projector<any>>()}
    
  `;
}
