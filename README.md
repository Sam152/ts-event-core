<!-- deno-fmt-ignore-start -->

<!-- This file was automatically generated from ./docs/README.ts -->

ts-event-core
====

This project is an implementation of Event Sourcing, written in TypeScript using functional programming. It contains a set of loosely coupled components which can be interchanged and composed together.

----

1. [Example domain](#example-domain)
   1. [Aggregate roots](#aggregate-roots)
   2. [State](#state)
   3. [Commands](#commands)
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

## Example domain

Our example domain comes from the airline industry. We've been tasked with figuring out how to notify passengers when flights are delayed. We've been given a few basic requirements:

* We should be able to schedule flights.
* Passengers can purchase tickets to those flights and set notification preferences on their account.
* When flights are delayed, all ticket holders are sent either an SMS or email, depending on their preferences.

We will start by defining our domain, then explore how its consumed by components of the framework.

### Aggregate roots

A domain starts with a declaration of the aggregate roots. Each aggregate root has an identifier, in this
case FLIGHT and PASSENGER. This object represents a bundle of all the code contained within the domain and
is later consumed by components of the framework. [:arrow_upper_right:](test/airlineDomain/index.ts#L5-L13)

```typescript
export const airlineAggregateRoots = {
  FLIGHT: flightAggregateRoot,
  PASSENGER: passengerAggregateRoot,
};
```

An aggregate root definition contains a map of commands and state, describing the business rules. [:arrow_upper_right:](test/airlineDomain/aggregateRoot/flight/aggregateRoot.ts#L37-L51)

```typescript
export const flightAggregateRoot = {
  state: {
    version: 1,
    initialState: { status: "NOT_YET_SCHEDULED" },
    reducer: flightReducer,
  },
  commands: {
    scheduleFlight,
    purchaseTicket,
    delayFlight,
  },
} satisfies AggregateRootDefinition<FlightState, FlightEvent>;
```

### State

The main component of state is a reducer is responsible for creating a useful decision model out of the events raised
by the aggregate root.

In this case we're keeping track of the total number of seats we're allowed to sell as tickets are purchased, so that
we don't accidentally overbook a flight. [:arrow_upper_right:](test/airlineDomain/aggregateRoot/flight/reducer.ts#L4-L33)

```typescript
export function flightReducer(state: FlightState, event: FlightEvent): FlightState {
  switch (event.type) {
    case "FLIGHT_SCHEDULED": {
      return {
        status: "SCHEDULED",
        totalSeats: event.sellableSeats,
        totalAvailableSeats: event.sellableSeats,
        totalSeatsSold: 0,
        passengerManifest: [],
      };
    }
    case "TICKET_PURCHASED": {
      assertFlightScheduled(state);
      return {
        ...state,
        totalSeatsSold: state.totalSeatsSold + 1,
        totalAvailableSeats: state.totalAvailableSeats - 1,
        passengerManifest: [...state.passengerManifest, event.passengerId],
      };
    }
  }
  return state;
}
```


### Commands
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
