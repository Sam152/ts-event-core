import { documentType } from "./utils/documentType.ts";
import { EventStore } from "../src/eventStore/EventStore.ts";
import { documentFunction } from "./utils/documentFunction.ts";
import { createInMemoryEventStore } from "../src/eventStore/createInMemoryEventStore.ts";
import { createPostgresEventStore } from "../src/eventStore/createPostgresEventStore.ts";
import { AggregateRootDefinition } from "../src/aggregate/AggregateRootDefinition.ts";
import { Commander } from "../src/command/Commander.ts";
import { AggregateRootRepository } from "../src/aggregate/AggregateRootRepository.ts";
import { createBasicAggregateRootRepository } from "../src/aggregate/repository/createBasicAggregateRootRepository.ts";
import {
  createSnapshottingAggregateRootRepository,
} from "../src/aggregate/repository/createSnapshottingAggregateRootRepository.ts";
import { Projector } from "../src/projector/Projector.ts";
import { SnapshotStorage } from "../src/aggregate/SnapshotStorage.ts";

/**
 * Edit with soft-wrap enabled.
 */
export function README(): string {
  return `
    ts-event-core
    ====
    
    This project is a reference implementation of Event Sourcing implemented in TypeScript using a functional programming style. It contains a set of loosely coupled types (and implementations of these types) which can be interchanged depending on the use case.
    
    ----
    
    {{ index }}
    
    ----
    
    ## Aggregate root definition
    
    ${documentType<AggregateRootDefinition<any, any>>()}
    
    ## Commander
    
    ${documentType<Commander<any, any>>()}
    
    ## Aggregate root repository
    
    ${documentType<AggregateRootRepository<any, any>>()}
    
    ### Basic
    
    ${documentFunction(createBasicAggregateRootRepository)}
    
    ### Snapshotting
    
    ${documentFunction(createSnapshottingAggregateRootRepository)}
    
    #### Snapshot storage
    
    ${documentType<SnapshotStorage<any, any>>()}
    
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
