<!--- This file was automatically generated from ./docs/README.ts -->

ts-event-core
====

This project is a reference implementation of Event Sourcing implemented in TypeScript using a functional programming style. It contains a set of loosely coupled types (and implementations of these types) which can be interchanged depending on the use case.

----

1. [Aggregate root definition](#aggregate-root-definition)
2. [Commander](#commander)
3. [Event store](#event-store)
   1. [In-memory](#in-memory)
   2. [Postgres](#postgres)
4. [Aggregate root repository](#aggregate-root-repository)
5. [Commander](#commander)
6. [Projector](#projector)

----

## Aggregate root definition

[:arrow_upper_right:](src/aggregate/AggregateRootDefinition.ts#L5-L22) An aggregate root definition, the state and commands used to power
writes in an event sourced system.

```typescript
export type AggregateRootDefinition<TAggregateRootState, TEvent> = {
  commands: {
    [key: string]: <TCommandData extends never>(
      aggregate: TAggregateRootState,
      commandData: TCommandData,
    ) => TEvent | TEvent[];
  };
  state: {
    reducer: AggregateReducer<TAggregateRootState, TEvent>;
    initialState: () => TAggregateRootState;

    /**
     * Reducers can change, so when state is reduced and persisted, by way of a snapshot, we need to be able to
     * identify a version of the state.
     */
    version: AggregateStateVersion;
  };
};
```

## Commander

[:arrow_upper_right:](src/command/Commander.ts#L6-L20) When issuing a command...

```typescript
export type Commander<
  TAggregateRootDefinitionMap extends AggregateRootDefinitionMap<TAggregateMapTypes>,
  TAggregateMapTypes extends AggregateRootDefinitionMapTypes = AggregateRootDefinitionMapTypes,
> = <
  TAggregateRootType extends keyof TAggregateRootDefinitionMap,
  TCommandName extends keyof TAggregateRootDefinitionMap[TAggregateRootType]["commands"],
>(args: {
  aggregateRootType: TAggregateRootType;
  aggregateRootId: string;
  command: TCommandName;
  data: Parameters<TAggregateRootDefinitionMap[TAggregateRootType]["commands"][TCommandName]>[1];
}) => Promise<void>;
```

## Event store

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

### In-memory

[:arrow_upper_right:](src/eventStore/createMemoryEventStore.ts#L9-L46) An in-memory test store is most useful for testing purposes. Most use cases
would benefit from persistent storage.

```typescript
function createMemoryEventStore<TEvent extends Event>(): & EventStore<TEvent> & EventEmitter<TEvent>
```
    
<details>
<summary> Show full <code>createMemoryEventStore</code> definition :point_down:</summary>

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

### Postgres

[:arrow_upper_right:](src/eventStore/createPostgresEventStore.ts#L5-L83) A persistent event store backed by Postgres.

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

```typescript
function createPostgresEventStore<TEvent extends Event>(...): EventStore<TEvent>
```
    
<details>
<summary> Show full <code>createPostgresEventStore</code> definition :point_down:</summary>

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

## Aggregate root repository

## Commander

## Projector
