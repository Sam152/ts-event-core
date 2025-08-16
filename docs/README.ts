import { documentType } from "./utils/documentType.ts";
import { Event, EventStore } from "../src/eventStore/EventStore.ts";

/**
 * Best edit with soft-wrap enabled.
 */
export function README(): string {
  return `
    ts-event-core
    ====
    
    This project is a reference implementation of event sourcing implemented in TypeScript using a functional programming style.
    
    It contains a set of loosely coupled types which show how the core components of an event sourced system might fit together and various implementations of each type. Provided these types can be satisfied, components can be swapped and interchanged.
    
    ----
    
    {{ index }}
    
    ----
    
    ## Key components
    
    ### Event store
    
    ${documentType<Event>()}
    
    ${documentType<EventStore>()}
    
    #### In-memory
    #### Postgres
    
    ### Aggregate root definition
    
    ### Aggregate root repository
    
    ### Command issuer
    
    ### Projector
    
    ## Example domain
  `;
}
