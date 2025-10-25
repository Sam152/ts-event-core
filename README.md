<!--- This file was automatically generated from ./docs/README.ts -->

ts-event-core
====

This project is an implementation of Event Sourcing, written TypeScript using a functional programming paradigm.

It contains a set of loosely coupled types (and various implementations of these types) which can be composed and interchanged.

----

1. [Domain implementation](#domain-implementation)
   1. [Aggregate root definitions](#aggregate-root-definitions)
   2. [Process manager](#process-manager)
2. [Key components](#key-components)
   1. [[`CommandIssuer`](src/command/CommandIssuer.ts)](#commandissuersrccommandcommandissuerts)
      1. [Implementations](#implementations)
   2. [[`AggregateRootRepository`](src/aggregate/AggregateRootRepository.ts)](#aggregaterootrepositorysrcaggregateaggregaterootrepositoryts)
      1. [Implementations](#implementations)
   3. [[`SnapshotStorage`](src/aggregate/SnapshotStorage.ts)](#snapshotstoragesrcaggregatesnapshotstoragets)
      1. [Implementations](#implementations)
   4. [[`EventStore`](src/eventStore/EventStore.ts)](#eventstoresrceventstoreeventstorets)
      1. [Implementations](#implementations)
   5. [Projector](#projector)
   6. [Implementations](#implementations)
   7. [Implementations](#implementations)
3. [Component compositions](#component-compositions)
4. [Limitations and trade-offs](#limitations-and-trade-offs)

----

## Domain implementation

### Aggregate root definitions
### Process manager

## Key components

### [`CommandIssuer`](src/command/CommandIssuer.ts)

When issuing a command...

#### Implementations

* [`createBasicCommandIssuer`](src/command/createBasicCommandIssuer.ts#L8-L40)
* [`createQueuedCommandIssuer`](src/command/createQueuedCommandIssuer.ts#L8-L25)

### [`AggregateRootRepository`](src/aggregate/AggregateRootRepository.ts)

Retrieve and persist aggregate roots.

#### Implementations

* [`createBasicAggregateRootRepository`](src/aggregate/repository/createBasicAggregateRootRepository.ts#L5-L56)
* [`createSnapshottingAggregateRootRepository`](src/aggregate/repository/createSnapshottingAggregateRootRepository.ts#L6-L91)

### [`SnapshotStorage`](src/aggregate/SnapshotStorage.ts)

The storage used for snapshots can be.

#### Implementations

* [`createInMemorySnapshotStorage`](src/aggregate/snapshot/createInMemorySnapshotStorage.ts#L10-L56) 
* [`createPostgresSnapshotStorage`](src/aggregate/snapshot/createPostgresSnapshotStorage.ts#L5-L73) 

### [`EventStore`](src/eventStore/EventStore.ts)



#### Implementations

* [`createInMemoryEventStore`](src/eventStore/createInMemoryEventStore.ts#L9-L65)
* [`createPostgresEventStore`](src/eventStore/createPostgresEventStore.ts#L5-L99)

### Projector

Projectors take a stream of events from an event store and transform them into
ul data structures. These are often called read models.

 models are typically eventually consistent and thus are not required to
re to any of the boundaries defined by the aggregate roots.

read models can be added at any point in time and can then be deleted after
 are no longer useful.

 may deal with data structures that describe all the events in the system as
ole or selectively choose to build smaller structures out of individual aggregates
ther relations found within the event payload.

e data structures can be stored in memory, relational databases, speciality
bases or any other system that provides utility and value to the application.

these reasons, the signature of a projection is extremely simple, the only contract
vent sourced system needs to fulfil is providing a stream of events. How data can be
ieved or accessed beyond that, is entirely dependent on the use case.

### Implementations

* [`createMemoryReducedProjector`](src/projection/createMemoryReducedProjector.ts#L4-L16)

### Implementations

## Component compositions

## Limitations and trade-offs
