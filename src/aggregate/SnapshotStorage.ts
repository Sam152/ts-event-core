import type {
  AggregateRootDefinitionMap,
  AggregateRootDefinitionMapTypes,
  AggregateStateVersion,
} from "./AggregateRootDefinition.ts";
import type { AggregateRootInstance } from "./AggregateRootInstance.ts";

/**
 * Some aggregate roots contain a large number of events. Components like `createSnapshottingAggregateRootRepository` can
 * persist a snapshot of aggregate state to avoid needing to load large streams of events. Snapshots can be stored in
 * memory or be persistent.
 *
 * The `aggregateRootDefinition.state.version` is a mechanism for versioning state, as the underlying reducer evolves.
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
