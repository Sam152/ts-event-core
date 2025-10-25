import { documentType, linkToType } from "./utils/documentType.ts";
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
import { Projector } from "../src/projection/Projector.ts";
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
    
    ## Example domain
    
    ### Aggregate roots
    ### Process manager
    
    ## Key components
    
    ### ${linkToType<AggregateRootDefinition<any, any>>()}
    
    ${documentType<AggregateRootDefinition<any, any>>()}
    
    #### Implementations
    
    * Foo
    * Bar
    
    ### ${linkToType<CommandIssuer<any, any>>()}
    
    ${documentType<CommandIssuer<any, any>>()}
    
    ### ${linkToType<AggregateRootRepository<any, any>>()}
    
    ${documentType<AggregateRootRepository<any, any>>()}
    
    #### Basic
    
    ${documentFunction(createBasicAggregateRootRepository)}
    
    #### Snapshotting
    
    ${documentFunction(createSnapshottingAggregateRootRepository)}
    
    ##### In-memory
    
    ${documentFunction(createInMemorySnapshotStorage)}
    
    ##### Postgres
    
    ${documentFunction(createPostgresSnapshotStorage)}
    
    ### ${linkToType<EventStore>()}
    
    ${documentType<EventStore>()}
    
    #### In-memory
    
    ${documentFunction(createInMemoryEventStore)}
    
    #### Postgres
    
    ${documentFunction(createPostgresEventStore)}
 
    ### Projector
    
    ${documentType<Projector<any>>()}
    
    ## Component compositions
    
  `;
}
