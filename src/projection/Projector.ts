import type { Event } from "../eventStore/EventStore.ts";

/**
 * Projectors take a stream of events from an event store and transform them into
 * useful data structures. These are often called read models. Read models are
 * considered eventually consistent and can be created or deleted as required.
 *
 * These data structures can be stored in memory, relational databases, speciality
 * databases or any other system.
 *
 * For these reasons, the signature of a projection is extremely simple, the only
 * contract that needs to be fulfilled is providing a stream of events. How data is
 * reduced, retrieved or accessed beyond, is dependent on the use case.
 */
export type Projector<TEvent extends Event> = (event: TEvent) => void | Promise<void>;
