import { documentType } from "./utils/documentType.ts";
import { EventStore } from "../src/eventStore/EventStore.ts";

export function README(): string {
  return `
    ts-event-core
    ====
    
    This project is a reference implementation of event sourcing implemented in TypeScript
    using a functional programming style.
    
    It contains a series of loosely coupled types which show how the core of an event
    sourced system might fit together and various implementations of each type. Provided
    these types can be satisfied, components can be swapped and interchanged.
    
    ----
    
    {{ index }}
    
    ----
    
    ${documentType<EventStore>()}
  `;
}
