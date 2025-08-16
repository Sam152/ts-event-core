<!--- This file was automatically generated from ./docs/README.ts -->

ts-event-core
====

This project is a reference implementation of event sourcing implemented in TypeScript using a functional programming style.

It contains a set of loosely coupled types which show how the core components of an event sourced system might fit together and various implementations of each type. Provided these types can be satisfied, components can be swapped and interchanged.

----

1. [Key components](#key-components)
   1. [Event store](#event-store)
      1. [In-memory](#in-memory)
      2. [Postgres](#postgres)
   2. [Aggregate root definition](#aggregate-root-definition)
   3. [Aggregate root repository](#aggregate-root-repository)
   4. [Command issuer](#command-issuer)
   5. [Projector](#projector)
2. [Example domain](#example-domain)

----

## Key components

### Event store

[↗️](src/eventStore/EventStore.ts#L6-L16) Events record statements of fact that occurred within a domain, while processing
commands. They are the single source of truth for all recorded data in the domain.

```typescript
export type Event<TEventPayload = unknown> = {
  aggregateRootType: string;
  aggregateRootId: string;
  aggregateVersion: number;
  recordedAt: Date;
  payload: TEventPayload;
};
```

```typescript
export type EventStore<TEvent extends Event = Event> = {
  persist: (events: TEvent[]) => Promise<void>;
  retrieve: (args: {
    aggregateRootType: string;
    aggregateRootId: string;
    fromVersion?: number;
  }) => AsyncGenerator<TEvent>;
};
```

#### In-memory
#### Postgres

### Aggregate root definition

### Aggregate root repository

### Command issuer

### Projector

## Example domain
