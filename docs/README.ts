import { documentType } from "./utils/documentType.ts";
import { Event, EventStore } from "../src/eventStore/EventStore.ts";
import { documentFunction } from "./utils/documentFunction.ts";
import { createMemoryEventStore } from "../src/eventStore/createMemoryEventStore.ts";
import { createPostgresEventStore } from "../src/eventStore/createPostgresEventStore.ts";

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
    
    ## Key components
    
    ### Event store
    
    ${documentType<Event>()}
    
    ${documentType<EventStore>()}
    
    #### In-memory
    
    ${documentFunction(createMemoryEventStore)}
    
    #### Postgres
    
    ${documentFunction(createPostgresEventStore)}
    
    ### Aggregate root definition
    
    ### Aggregate root repository
    
    ### Command issuer
    
    ### Projector
    
    ## Example domain
  `;
}
