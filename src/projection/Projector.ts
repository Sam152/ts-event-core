import { Event } from "../eventStore/EventStore.ts";

/**
 * Projectors take a stream of events from an event store and transform them into
 * useful data structures. These are often called read models.
 *
 * Read models are typically eventually consistent and thus are not required to
 * adhere to any of the boundaries defined by the aggregate roots.
 *
 * New read models can be added at any point in time and can then be deleted after
 * they are no longer useful.
 *
 * They may deal with data structures that describe all the events in the system as
 * a whole or selectively choose to build smaller structures out of individual aggregates
 * or other relations found within the event payload.
 *
 * These data structures can be stored in memory, relational databases, speciality
 * databases or any other system that provides utility and value to the application.
 *
 * For these reasons, the signature of a projection is extremely simple, the only contract
 * an event sourced system needs to fulfil is providing a stream of events. How data can be
 * retrieved or accessed beyond that, is entirely dependent on the use case.
 */
export type Projector<TEvent extends Event> = (event: TEvent) => void | Promise<void>;
