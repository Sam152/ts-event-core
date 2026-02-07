import { beforeAll, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { createQueuedCommandIssuer } from "./createQueuedCommandIssuer.ts";
import { createPostgresEventStore } from "../../eventStore/createPostgresEventStore.ts";
import {
  createInMemorySnapshotStorage,
  createSnapshottingAggregateRootRepository,
} from "@ts-event-core/framework";
import type { Event } from "@ts-event-core/framework";
import { createTestConnection } from "../../../test/integration/utils/infra/testPostgresConnectionOptions.ts";
import { prepareTestDatabaseContainer } from "../../../test/integration/utils/prepareTestDatabaseContainer.ts";
import { tryThing } from "../../../test/integration/utils/tryThing.ts";
import { arrayOfSize } from "../../../test/integration/utils/arrayOfSize.ts";

const COMMANDS_PER_AGGREGATE = 100;
const AGGREGATE_COUNT = 5;
const WORKER_COUNT = 5;

const connection = createTestConnection();

describe("createQueuedCommandIssuer", () => {
  beforeAll(prepareTestDatabaseContainer);

  it("processes commands in a consistent fashion", async () => {
    const eventStore = createPostgresEventStore<Event<CounterEvent>>({ connection });

    const aggregateRoots = { COUNTER: counterAggregateRoot };
    const aggregateRootRepository = createSnapshottingAggregateRootRepository({
      aggregateRoots,
      eventStore,
      snapshotStorage: createInMemorySnapshotStorage(),
    });

    const { issueCommand, startQueueWorker } = createQueuedCommandIssuer({
      connection,
      aggregateRoots,
      aggregateRootRepository,
    });

    const aggregateIds = arrayOfSize(AGGREGATE_COUNT, (i) => `counter-${i + 1}`);

    for (const aggregateRootId of aggregateIds) {
      for (let i = 0; i < COMMANDS_PER_AGGREGATE; i++) {
        await issueCommand({
          aggregateRootType: "COUNTER",
          aggregateRootId,
          command: "increment",
          data: { sequenceNumber: i + 1 },
        });
      }
    }

    const workers = arrayOfSize(WORKER_COUNT, () => startQueueWorker());

    await tryThing(async () => {
      const [{ count }] = await connection`
          SELECT count(*)::int as count FROM event_core.command_queue WHERE status = 'pending'
        `;
      assertEquals(count, 0);
    });

    const loadedAggregateRoots = await Promise.all(
      aggregateIds.map((aggregateRootId) =>
        aggregateRootRepository.retrieve({
          aggregateRootType: "COUNTER",
          aggregateRootId,
        })
      ),
    );

    assertEquals(
      loadedAggregateRoots.map((aggregateRoot) => aggregateRoot.state),
      arrayOfSize(AGGREGATE_COUNT, () => ({
        inOrder: true,
        count: COMMANDS_PER_AGGREGATE,
        lastSequence: COMMANDS_PER_AGGREGATE,
      })),
    );

    await Promise.all(workers.map((worker) => worker.halt()));
    await connection.end();
  });
});

type CounterState = {
  count: number;
  lastSequence: number;
  inOrder: boolean;
};

type CounterEvent = {
  type: "INCREMENTED";
  sequenceNumber: number;
  wasInOrder: boolean;
};

const counterAggregateRoot = {
  state: {
    version: 1,
    initialState: { count: 0, lastSequence: 0, inOrder: true },
    reducer: (state: CounterState, event: CounterEvent): CounterState => ({
      count: state.count + 1,
      lastSequence: event.sequenceNumber,
      inOrder: state.inOrder && event.wasInOrder,
    }),
  },
  commands: {
    increment: (
      state: CounterState,
      data: { sequenceNumber: number },
    ): CounterEvent => ({
      type: "INCREMENTED",
      sequenceNumber: data.sequenceNumber,
      wasInOrder: data.sequenceNumber === state.lastSequence + 1,
    }),
  },
};
