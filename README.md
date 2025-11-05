<!-- deno-fmt-ignore-start -->

<!-- This file was automatically generated from ./docs/README.ts -->

ts-event-core
====

This project is an implementation of Event Sourcing, written in TypeScript using functional programming techniques. It contains a set of loosely coupled components which can be composed together and an example domain demonstrating how they can be used.

----

1. [Domain](#domain)
   1. [Aggregate roots](#aggregate-roots)
   2. [Commands](#commands)
   3. [State](#state)
   4. [Process manager](#process-manager)
   5. [Bootstraps](#bootstraps)
2. [Key framework components](#key-framework-components)
   1. [`CommandIssuer`](#commandissuer)
      1. [Implementations](#implementations)
   2. [`AggregateRootRepository`](#aggregaterootrepository)
      1. [Implementations](#implementations)
   3. [`SnapshotStorage`](#snapshotstorage)
      1. [Implementations](#implementations)
   4. [`EventStore`](#eventstore)
      1. [Implementations](#implementations)
   5. [`Projector`](#projector)
      1. [Implementations](#implementations)
3. [Limitations, trade-offs & todos](#limitations-trade-offs-todos)
4. [References and inspiration](#references-and-inspiration)

----

## Domain

### Aggregate roots

[:arrow_upper_right:](test/airlineDomain/index.ts#L5-L12) For any given domain, a map between an aggregate root type and an aggregate root definition is created.
This object becomes a key declaration that is passed into other framework components.

```typescript
export const airlineAggregateRoots = {
  FLIGHT: flightAggregateRoot,
  PASSENGER: passengerAggregateRoot,
};
```

[:arrow_upper_right:](test/airlineDomain/aggregateRoot/flight/aggregateRoot.ts#L37-L51) Each aggregate root is a declaration that consists of commands and state.

```typescript
export const flightAggregateRoot = {
  commands: {
    scheduleFlight,
    purchaseTicket,
    delayFlight,
  },
  state: {
    version: 1,
    initialState: { status: "NOT_YET_SCHEDULED" },
    reducer: flightReducer,
  },
} satisfies AggregateRootDefinition<FlightState, FlightEvent>;
```

### Commands
### State
### Process manager
### Bootstraps

## Key framework components

### [`CommandIssuer`](src/command/CommandIssuer.ts#L6-L20)

When issuing a command...

#### Implementations

* [`createBasicCommandIssuer`](src/command/createBasicCommandIssuer.ts#L9-L50)
* [`createQueuedCommandIssuer`](src/command/createQueuedCommandIssuer.ts#L8-L25)

### [`AggregateRootRepository`](src/aggregate/AggregateRootRepository.ts#L4-L25)

Retrieve and persist aggregate roots.

#### Implementations

* [`createBasicAggregateRootRepository`](src/aggregate/repository/createBasicAggregateRootRepository.ts#L5-L56)
* [`createSnapshottingAggregateRootRepository`](src/aggregate/repository/createSnapshottingAggregateRootRepository.ts#L6-L92)

### [`SnapshotStorage`](src/aggregate/SnapshotStorage.ts#L8-L35)

The storage used for snapshots can be.

#### Implementations

* [`createInMemorySnapshotStorage`](src/aggregate/snapshot/createInMemorySnapshotStorage.ts#L10-L56) 
* [`createPostgresSnapshotStorage`](src/aggregate/snapshot/createPostgresSnapshotStorage.ts#L5-L73) 

### [`EventStore`](src/eventStore/EventStore.ts#L22-L37)

It's where we store events...

#### Implementations

* [`createInMemoryEventStore`](src/eventStore/createInMemoryEventStore.ts#L9-L65)
* [`createPostgresEventStore`](src/eventStore/createPostgresEventStore.ts#L5-L99)

### [`Projector`](src/projection/Projector.ts#L3-L24)

Projectors take a stream of events from an event store and transform them into
useful data structures. These are often called read models.

Read models are typically eventually consistent and thus are not required to
adhere to any of the boundaries defined by the aggregate roots.

New read models can be added at any point in time and can then be deleted after
they are no longer useful.

They may deal with data structures that describe all the events in the system as
a whole or selectively choose to build smaller structures out of individual aggregates
or other relations found within the event payload.

These data structures can be stored in memory, relational databases, speciality
databases or any other system that provides utility and value to the application.

For these reasons, the signature of a projection is extremely simple, the only contract
an event sourced system needs to fulfil is providing a stream of events. How data can be
retrieved or accessed beyond that, is entirely dependent on the use case.

#### Implementations

* [`createMemoryReducedProjector`](src/projection/createMemoryReducedProjector.ts#L4-L16)

## Limitations, trade-offs & todos

## References and inspiration
