import {
  AggregateRootDefinitionMap,
  AggregateRootDefinitionMapTypes,
  AggregateStateVersion,
} from "./AggregateRootDefinition.ts";
import { AggregateRootInstance } from "./AggregateRootInstance.ts";

/**
 * Some aggregates contain a large number of events. Components like `createSnapshottingAggregateRootRepository` can
 * persist a snapshot of aggregate state, to avoid needing to load and reduce many events. Snapshots can be stored in
 * memory or be persistent.
 *
 * The `aggregateRootDefinition.state.version` property governs which snapshots can be retrieved, to satisfy a given
 * request to load an aggregate, as state can change over time.
 */
export type SnapshotStorage<
  TAggregateDefinitionMap extends AggregateRootDefinitionMap<TAggregateMapTypes>,
  TAggregateMapTypes extends AggregateRootDefinitionMapTypes,
> = {
  retrieve: <
    TAggregateRootType extends keyof TAggregateDefinitionMap,
    TAggregateDefinition extends TAggregateDefinitionMap[TAggregateRootType],
  >(
    args: {
      aggregateRootType: TAggregateRootType;
      aggregateRootId: string;
      stateVersion: AggregateStateVersion;
    },
  ) => Promise<undefined | AggregateRootInstance<TAggregateRootType, TAggregateDefinition>>;

  persist: <
    TAggregateRootType extends keyof TAggregateDefinitionMap,
    TAggregateDefinition extends TAggregateDefinitionMap[TAggregateRootType],
  >(
    args: {
      aggregateRoot: AggregateRootInstance<TAggregateRootType, TAggregateDefinition>;
      stateVersion: AggregateStateVersion;
    },
  ) => Promise<void>;
};
