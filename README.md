<!--- This file was automatically generated from ./docs/README.ts -->

ts-event-core
====

This project is a reference implementation of Event Sourcing implemented in TypeScript using a functional programming style. It contains a set of loosely coupled types (and implementations of these types) which can be interchanged depending on the use case.

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

[:arrow_upper_right:](src/eventStore/EventStore.ts#L6-L16) Events record statements of fact that occurred within a domain, while processing
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

[:arrow_upper_right:](src/eventStore/memory/createMemoryEventStore.ts#L9-L46) An in-memory test store is most useful for testing purposes. Most use cases
would benefit from persistent storage.

`(inline code)`{:.language-clojure .highlight}

<details>
<summary>:point_down: <span>`function createMemoryEventStore&#60;TEvent extends Event&#62;(): &#38; EventStore&#60;TEvent&#62; &#38; EventEmitter&#60;TEvent&#62;`</span></summary>


```typescript
export function createMemoryEventStore<TEvent extends Event>():
  & EventStore<TEvent>
  & EventEmitter<TEvent> {
  const storage: Record<string, TEvent[]> = {};
  const subscribers: EventSubscriber<TEvent>[] = [];

  return {
    addSubscriber: subscribers.push.bind(subscribers),
    persist: async (events) => {
      await Promise.all(events.map(async (event) => {
        const key = streamKey(event.aggregateRootType, event.aggregateRootId);
        storage[key] = storage[key] ?? [];

        if (storage[key].some((existing) => existing.aggregateVersion === event.aggregateVersion)) {
          throw new AggregateRootVersionIntegrityError();
        }

        storage[key].push(event);
        await Promise.all(subscribers?.map((subscriber) => subscriber(event)) ?? []);
      }));
    },
    retrieve: async function* ({
      aggregateRootType,
      aggregateRootId,
      fromVersion,
    }) {
      const key = streamKey(aggregateRootType, aggregateRootId);
      const events = storage[key] || [];
      yield* (
        fromVersion !== undefined ? events.filter((event) => event.aggregateVersion > fromVersion) : events
      );
    },
  };
}
```

</details>

#### Postgres

[:arrow_upper_right:](src/eventStore/postgres/createPostgresEventStore.ts#L6-L84) A persistent event store backed by Postgres.

This implementation depends on the following schema:

```sql
  CREATE TABLE event_core.events
  (
      id                  BIGSERIAL PRIMARY KEY,
      "aggregateRootType" TEXT        NOT NULL,
      "aggregateRootId"   TEXT        NOT NULL,
      "aggregateVersion"  INT         NOT NULL,
      "recordedAt"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      payload             JSONB       NOT NULL,

      CONSTRAINT "aggregateIntegrity"
          UNIQUE ("aggregateRootType", "aggregateRootId", "aggregateVersion")
  );
```

`(inline code)`{:.language-clojure .highlight}

<details>
<summary>:point_down: <span>`function createPostgresEventStore&#60;TEvent extends Event&#62;(...): EventStore&#60;TEvent&#62;`</span></summary>


```typescript
export function createPostgresEventStore<TEvent extends Event>(
  { connection: sql }: { connection: ReturnType<typeof postgres> },
): EventStore<TEvent> {
  return {
    persist: async (events) => {
      if (events.length === 0) {
        return;
      }
      try {
        await sql`
          INSERT INTO event_core.events ${
          sql(
            events.map((event) => ({
              aggregateRootType: event.aggregateRootType,
              aggregateRootId: event.aggregateRootId,
              aggregateVersion: event.aggregateVersion,
              payload: event.payload as JSONValue,
            })),
          )
        }
        `;
      } catch (error) {
        const isAggregateIntegrityError = error &&
          typeof error === "object" &&
          "constraint_name" in error &&
          error.constraint_name === "aggregateIntegrity";

        if (isAggregateIntegrityError) {
          throw new AggregateRootVersionIntegrityError();
        }

        throw error;
      }
    },

    retrieve: async function* ({
      aggregateRootType,
      aggregateRootId,
      fromVersion = 0,
    }: {
      aggregateRootType: string;
      aggregateRootId: string;
      fromVersion?: number;
    }) {
      const cursor = sql<TEvent[]>`
        SELECT *
        FROM "event_core"."events"
        WHERE "aggregateRootType" = ${aggregateRootType}
          AND "aggregateRootId" = ${aggregateRootId}
          AND "aggregateVersion" > ${fromVersion}
        ORDER BY "aggregateVersion" ASC
    `.cursor(1000);

      for await (const rows of cursor) {
        yield* rows;
      }
    },
  };
}
```

</details>

### Aggregate root definition

### Aggregate root repository

### Command issuer

### Projector

## Example domain
