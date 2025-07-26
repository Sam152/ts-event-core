import {
    AggregateRootDefinitionMap,
    AggregateRootDefinitionMapTypes,
    AggregateStateVersion,
} from "./AggregateRootDefinition.ts";
import { LoadedAggregateRoot } from "./LoadedAggregateRoot.ts";

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
      aggregateRootStateVersion: AggregateStateVersion;
    },
  ) => Promise<undefined | LoadedAggregateRoot<TAggregateRootType, TAggregateDefinition>>;

  persist: <
    TAggregateRootType extends keyof TAggregateDefinitionMap,
    TAggregateDefinition extends TAggregateDefinitionMap[TAggregateRootType],
  >(
    args: {
      aggregateRoot: LoadedAggregateRoot<TAggregateRootType, TAggregateDefinition>;
      aggregateRootStateVersion: AggregateStateVersion;
    },
  ) => Promise<void>;
};
