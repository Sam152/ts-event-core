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
   5. [Projections](#projections)
   6. [Bootstraps](#bootstraps)
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
is later consumed by components of the framework. [:link:](test/airlineDomain/index.ts#L5-L13)

```typescript
export const airlineAggregateRoots = {
  FLIGHT: flightAggregateRoot,
  PASSENGER: passengerAggregateRoot,
};
```

An aggregate root definition contains a map of commands and state, describing the business rules. [:link:](test/airlineDomain/aggregateRoot/flight/aggregateRoot.ts#L37-L51)

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
we don't accidentally overbook a flight. [:link:](test/airlineDomain/aggregateRoot/flight/reducer.ts#L4-L33)

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

Commands are pure functions. They receive a state object and command data from the issuer as arguments. They return
an event (or array of events), which occurred as a result of processing the command.

Since these are pure functions any functional programming techniques can be applied here. A lot of the commands in this
domain require that a flight has already been scheduled, so the `withScheduledFlight` HOF takes care of this check
for us, returning a `TICKET_PURCHASED_FAILED` event on our behalf and narrowing the `FlightState` argument into
`ScheduledFlightState`. [:link:](test/airlineDomain/aggregateRoot/flight/command/purchaseTicket.ts#L4-L34)

```typescript
export const purchaseTicket = withScheduledFlight("TICKET_PURCHASED_FAILED", (
  flight: ScheduledFlightState,
  { passengerId, purchasePriceAudCents }: {
    passengerId: string;
    purchasePriceAudCents: number;
  },
): FlightEvent => {
  if (flight.totalAvailableSeats === 0) {
    return {
      type: "TICKET_PURCHASED_FAILED",
      reason: "NO_AVAILABLE_SEATS",
    };
  }
  return {
    type: "TICKET_PURCHASED",
    passengerId: passengerId,
    purchasePrice: {
      currency: "AUD",
      cents: purchasePriceAudCents,
    },
  };
});
```

### Process manager

A process manager facilitates coordination between aggregates. In this case, when a `FLIGHT_DELAYED` event is raised,
we must issue a command for each of the impacted passengers, to notify them of the delay.

Command processing within a single aggregate is considered strongly consistent, data passed into each command is guaranteed to
be up-to-date and the outcome of a command will never be committed if it conflicts with any commands running in parallel
for the same aggregate.

The same does not apply between aggregates. If a flight is delayed the moment a ticket is purchased, the passenger may
or may not be notified of the delay. Passengers are notified of delays at some point in the future, after a delays has been
recorded. These tradeoffs are completely acceptable in our airline domain.

Features which require strong consistency (such as not overbooking a flight) must be validated within a single aggregate
root. If consistency issues are a headache in a given domain, it may be a sign that aggregates roots need to be less granular.
The granularity of aggregates generally trade-off parallelism and throughput with consistency. In this case, passengers
updating their notification preferences can happen in parallel to flight scheduling and ticket purchasing. [:link:](test/airlineDomain/processManager/flightDelayProcessManager.ts#L4-L41)

```typescript
export async function flightDelayProcessManager(
  { event, issueCommand }: {
    event: AirlineDomainEvent;
    issueCommand: CommandIssuer<typeof airlineAggregateRoots>;
  },
) {
  if (event.payload.type === "FLIGHT_DELAYED") {
    const delayedUntil = event.payload.delayedUntil;
    await Promise.all(event.payload.impactedPassengerIds.map(async (impactedPassenger) => {
      await issueCommand({
        aggregateRootType: "PASSENGER",
        command: "notifyOfFlightDelay",
        aggregateRootId: impactedPassenger,
        data: {
          flightNumber: event.aggregateRootId,
          delayedUntil,
        },
      });
    }));
  }
}
```

### Projections

With our domain producing events, we can extract valuable insights from them. Projections (or read models) are
data structures built from our event store which can answer questions we have of our data or satisfy certain access
patterns.

In this case, we've been tasked with producing a lifetime earnings report, summing the purchase price of all tickets
ever sold. Like our decision model, this is also structured as a reducer, but there is no hard requirement where this
data is stored or how the data structure is built. [:link:](test/airlineDomain/projection/lifetimeEarningsReport.ts#L12-L29)

```typescript
export const lifetimeEarningsReport: LifetimeEarningsReportProjection = {
  initialState: {
    lifetimeEarningsCents: 0,
  },
  reducer: (state: LifetimeEarningsReport, event: AirlineDomainEvent) => ({
    lifetimeEarningsCents: state.lifetimeEarningsCents +
      (event.payload.type === "TICKET_PURCHASED" ? event.payload.purchasePrice.cents : 0),
  }),
};
```

### Bootstraps

To bootstrap a domain into a working application, key framework components need to be composed together with the
domain. All components have in-memory implementations, which allow for fast integration testing and persistent components
where applicable, which are more suited to production.

The framework does not dictate the shape or properties of a bootstrap, but instead provides a library of underlying
components which should be composed together depending on the use case.

The [`event-sourcing-bootstrap.test.ts`](test/integration/event-sourcing-bootstrap.test.ts) test is a good reference
for initializing an in-memory bootstrap and a production bootstrap, both which pass the same test case, which begins
with scheduling a flight:

```typescript
it("allows us to schedule a flight", async () => {
  await issueCommand({
    aggregateRootType: "FLIGHT",
    aggregateRootId: "SB93",
    command: "scheduleFlight",
    data: {
      departureTime: new Date("2035-01-01T05:00:00Z"),
      sellableSeats: 3,
    },
  });
});
```

...and concludes asserting notifications were sent:

```typescript
it("ensures notifications are sent to affected passengers through the correct channel", async () => {
  await tryThing(() =>
    assertArrayIncludes(notificationLog, [
      "EMAIL: sam@example.com Flight delayed Hi, Flight SB93 has been delayed. Sorry about that.",
      "SMS: +61491570158 Uh-oh! Flight SB93 has been delayed... we're sorry :(",
    ])
  );
});
```

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
