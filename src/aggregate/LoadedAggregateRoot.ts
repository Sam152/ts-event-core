import { AggregateRootDefinition } from "./AggregateRootDefinition.ts";

export type LoadedAggregateRoot<
  TAggregateType,
  TAggregateDefinition extends AggregateRootDefinition,
> = {
  aggregateRootType: TAggregateType;
  aggregateRootId: string;
  state: ReturnType<TAggregateDefinition["state"]["reducer"]>;

  /**
   * The aggregate version, if the loaded aggregate was previously saved. If
   * the aggregate is new, this will be undefined.
   */
  aggregateVersion?: number;
};
