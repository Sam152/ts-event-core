<!--- This file was automatically generated from ./docs/README.ts -->

ts-event-core
====

This project is a reference implementation of Event Sourcing implemented in TypeScript using a functional programming style. It contains a set of loosely coupled types (and implementations of these types) which can be interchanged depending on the use case.

----

1. [Aggregate root definition](#aggregate-root-definition)
2. [Commander](#commander)
3. [Aggregate root repository](#aggregate-root-repository)
   1. [Basic aggregate root repository](#basic-aggregate-root-repository)
   2. [Snapshotting aggregate root repository](#snapshotting-aggregate-root-repository)
4. [Event store](#event-store)
   1. [In-memory](#in-memory)
   2. [Postgres](#postgres)
5. [Projector](#projector)

----

## Aggregate root definition

[:arrow_upper_right:](src/aggregate/AggregateRootDefinition.ts#L5-L23) An aggregate root definition, the state and commands used to power
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

[:arrow_upper_right:](src/command/Commander.ts#L6-L21) When issuing a command...

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

## Aggregate root repository

[:arrow_upper_right:](src/aggregate/AggregateRootRepository.ts#L4-L26) Retrieve and persist aggregate roots.

```typescript
export type AggregateRootRepository<
  TAggregateDefinitionMap extends AggregateRootDefinitionMap<TAggregateMapTypes>,
  TAggregateMapTypes extends AggregateRootDefinitionMapTypes,
> = {
  retrieve: <TAggregateRootType extends keyof TAggregateDefinitionMap>(
    args: { aggregateRootType: TAggregateRootType; aggregateRootId: string },
  ) => Promise<AggregateRootInstance<TAggregateRootType, TAggregateDefinitionMap[TAggregateRootType]>>;

  persist: <
    TAggregateRootType extends keyof TAggregateDefinitionMap,
    TAggregateDefinition extends TAggregateDefinitionMap[TAggregateRootType],
    TLoadedAggregateRoot extends AggregateRootInstance<TAggregateRootType, TAggregateDefinition>,
  >(
    args: {
      aggregateRoot: TLoadedAggregateRoot;
      pendingEventPayloads: Parameters<TAggregateDefinition["state"]["reducer"]>[1][];
    },
  ) => Promise<void>;
};

```

### Basic aggregate root repository

[:arrow_upper_right:](src/aggregate/repository/createBasicAggregateRootRepository.ts#L5-L57) This aggregate root repository loads the whole event stream for an aggregate root,
and reduces them on demand. This can be suitable for use cases where an aggregate
root has a limited number of events.

```typescript
function createBasicAggregateRootRepository< TAggregateDefinitionMap extends AggregateRootDefinitionMap<TAggregateMapTypes>, TAggregateMapTypes extends AggregateRootDefinitionMapTypes = AggregateRootDefinitionMapTypes, >( { eventStore, aggregateRoots }:
```
    
<details>
<summary> Show full <code>createBasicAggregateRootRepository</code> definition :point_down:</summary>

```typescript
export function createBasicAggregateRootRepository<
  TAggregateDefinitionMap extends AggregateRootDefinitionMap<TAggregateMapTypes>,
  TAggregateMapTypes extends AggregateRootDefinitionMapTypes = AggregateRootDefinitionMapTypes,
>(
  { eventStore, aggregateRoots }: {
    eventStore: EventStore<EventsRaisedByAggregateRoots<TAggregateDefinitionMap, TAggregateMapTypes>>;
    aggregateRoots: TAggregateDefinitionMap;
  },
): AggregateRootRepository<TAggregateDefinitionMap, TAggregateMapTypes> {
  return {
    retrieve: async (
      { aggregateRootId, aggregateRootType },
    ) => {
      const definition = aggregateRoots[aggregateRootType];
      const events = eventStore.retrieve({
        aggregateRootId,
        aggregateRootType: aggregateRootType as string,
      });

      let aggregateVersion: number | undefined = undefined;
      let state = definition.state.initialState();
      for await (const event of events) {
        state = definition.state.reducer(state, event.payload);
        aggregateVersion = event.aggregateVersion;
      }

      return {
        aggregateRootId,
        aggregateRootType,
        aggregateVersion,
        state,
      };
    },
    persist: async ({ aggregateRoot, pendingEventPayloads }) => {
      const events: Event[] = pendingEventPayloads.map(
        (payload, i) => ({
          aggregateRootType: aggregateRoot.aggregateRootType as string,
          aggregateRootId: aggregateRoot.aggregateRootId,
          recordedAt: new Date(),
          aggregateVersion: (aggregateRoot.aggregateVersion ?? 0) + (i + 1),
          payload,
        }),
      );
      await eventStore.persist(events);
    },
  };
}

```

</details>

### Snapshotting aggregate root repository

[:arrow_upper_right:](src/aggregate/repository/createSnapshottingAggregateRootRepository.ts#L6-L92) Some aggregates have very large event streams. It can be helpful to take a snapshot of the aggregate to avoid loading
a large number of events when retrieving an aggregate.

```typescript
function createSnapshottingAggregateRootRepository< TAggregateDefinitionMap extends AggregateRootDefinitionMap<TAggregateMapTypes>, TAggregateMapTypes extends AggregateRootDefinitionMapTypes = AggregateRootDefinitionMapTypes, >( { eventStore, aggregateRoots, snapshotStorage }:
```
    
<details>
<summary> Show full <code>createSnapshottingAggregateRootRepository</code> definition :point_down:</summary>

```typescript
export function createSnapshottingAggregateRootRepository<
  TAggregateDefinitionMap extends AggregateRootDefinitionMap<TAggregateMapTypes>,
  TAggregateMapTypes extends AggregateRootDefinitionMapTypes = AggregateRootDefinitionMapTypes,
>(
  { eventStore, aggregateRoots, snapshotStorage }: {
    eventStore: EventStore<EventsRaisedByAggregateRoots<TAggregateDefinitionMap, TAggregateMapTypes>>;
    aggregateRoots: TAggregateDefinitionMap;
    snapshotStorage: SnapshotStorage<TAggregateDefinitionMap, TAggregateMapTypes>;
  },
): AggregateRootRepository<TAggregateDefinitionMap, TAggregateMapTypes> {
  return {
    retrieve: async (
      { aggregateRootId, aggregateRootType },
    ) => {
      const definition = aggregateRoots[aggregateRootType];

      const snapshot = await snapshotStorage.retrieve({
        aggregateRootId,
        aggregateRootType,
        aggregateRootStateVersion: definition.state.version,
      });

      const events = eventStore.retrieve({
        aggregateRootId,
        aggregateRootType: aggregateRootType as string,
        fromVersion: snapshot && snapshot.aggregateVersion,
      });

      let state = snapshot ? structuredClone(snapshot.state) : definition.state.initialState();
      let aggregateVersion = snapshot ? snapshot.aggregateVersion : undefined;

      for await (const event of events) {
        state = definition.state.reducer(state, event.payload);
        aggregateVersion = event.aggregateVersion;
      }

      return {
        aggregateRootId,
        aggregateRootType,
        aggregateVersion,
        state,
      };
    },
    persist: async ({ aggregateRoot, pendingEventPayloads }) => {
      const events: Event[] = pendingEventPayloads.map(
        (payload, i) => ({
          aggregateRootType: aggregateRoot.aggregateRootType as string,
          aggregateRootId: aggregateRoot.aggregateRootId,
          recordedAt: new Date(),
          aggregateVersion: (aggregateRoot.aggregateVersion ?? 0) + (i + 1),
          payload,
        }),
      );

      const definition = aggregateRoots[aggregateRoot.aggregateRootType];
      let state = aggregateRoot.state;
      for await (const event of events) {
        state = definition.state.reducer(state, event.payload);
      }

      const aggregateRootVersion: number | undefined = events.length > 0
        ? events.at(-1)!.aggregateVersion
        : aggregateRoot.aggregateVersion;

      // In this case we are choosing to snapshot the aggregate, each time new
      // events are persisted. We could choose a strategy of snapshotting every
      // N events, to find a balance between writing aggregates to storage and
      // retrieving events from the event store.
      await snapshotStorage.persist({
        aggregateRootStateVersion: definition.state.version,
        aggregateRoot: {
          state,
          aggregateRootId: aggregateRoot.aggregateRootId,
          aggregateVersion: aggregateRootVersion,
          aggregateRootType: aggregateRoot.aggregateRootType,
        },
      });

      await eventStore.persist(events);
    },
  };
}

```

</details>

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

[:arrow_upper_right:](src/eventStore/createInMemoryEventStore.ts#L9-L47) An in-memory test store is most useful for testing purposes. Most use cases
would benefit from persistent storage.

```typescript
function createInMemoryEventStore<TEvent extends Event>(): & EventStore<TEvent> & EventEmitter<TEvent>
```
    
<details>
<summary> Show full <code>createInMemoryEventStore</code> definition :point_down:</summary>

```typescript
export function createInMemoryEventStore<TEvent extends Event>():
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

[:arrow_upper_right:](src/eventStore/createPostgresEventStore.ts#L5-L84) A persistent event store backed by Postgres.

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

## Projector

[:arrow_upper_right:](src/projector/Projector.ts#L3-L24) Projectors take a stream of events from an event store and transform them into
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

For these reasons, the signature of a projector is extremely simple, the only contract
an event sourced system needs to fulfil is providing a stream of events. How data can be
retrieved or accessed beyond that, is entirely dependent on the use case.

```typescript
export type Projector<TEvent extends Event> = (event: TEvent) => void | Promise<void>;
```
