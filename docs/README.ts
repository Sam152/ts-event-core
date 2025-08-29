import { documentType } from "./utils/documentType.ts";
import { Event, EventStore } from "../src/eventStore/EventStore.ts";
import { documentFunction } from "./utils/documentFunction.ts";
import { createMemoryEventStore } from "../src/eventStore/createMemoryEventStore.ts";
import { createPostgresEventStore } from "../src/eventStore/createPostgresEventStore.ts";
import { AggregateRootDefinition } from "../src/aggregate/AggregateRootDefinition.ts";

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
    
    ${documentType<AggregateRootDefinition<unknown, unknown>>()}
    
    ## Event store
    
    ${documentType<Event>()}
    
    ${documentType<EventStore>()}
    
    ### In-memory
    
    ${documentFunction(createMemoryEventStore)}
    
    ### Postgres
    
    ${documentFunction(createPostgresEventStore)}
    
    ## Aggregate root repository
    
    ## Commander
    
    ## Projector

  `;
}
