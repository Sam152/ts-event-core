import { AggregateRootDefinition } from "./AggregateRootDefinition.ts";

export type AggregateRootInstance<
  TAggregateType,
  TAggregateDefinition extends AggregateRootDefinition<unknown, unknown>,
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
