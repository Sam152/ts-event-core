<!--- This file was automatically generated from ./docs/README.ts -->

ts-event-core
====

This project is a reference implementation of event sourcing implemented in TypeScript using a functional programming style.

It contains a set of loosely coupled types which show how the core components of an event sourced system might fit together and various implementations of each type. Provided these types can be satisfied, components can be swapped and interchanged.

----

1. [Key components](#key-components)
   1. [Event store](#event-store)
   2. [Aggregate root definition](#aggregate-root-definition)
   3. [Aggregate root repository](#aggregate-root-repository)
   4. [Command issuer](#command-issuer)
   5. [Projector](#projector)
2. [Example domain](#example-domain)

----

## Key components

### Event store

Events are the persistence mechanism for 

`/**`
Events record statements of fact that occurred within a domain, while processing
commands. They are the single source of truth for all recorded data in the domain.

### Aggregate root definition

`/**`
Events record statements of fact that occurred within a domain, while processing
commands. They are the single source of truth for all recorded data in the domain.
ort type Event<TEventPayload = unknown> = {
ggregateRootType: string;
ggregateRootId: string;
ggregateVersion: number;
ecordedAt: Date;
ayload: TEventPayload;

### Aggregate root repository

### Command issuer

### Projector

## Example domain
