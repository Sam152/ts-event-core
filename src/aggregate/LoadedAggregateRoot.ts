import { AggregateRootDefinition } from "./AggregateRootDefinition.ts";

export type LoadedAggregateRoot<
  TAggregateType,
  TAggregateDefinition extends AggregateRootDefinition,
> = {
  aggregateRootType: TAggregateType;
  aggregateRootId: string;
  state: ReturnType<TAggregateDefinition["reducer"]>;
  version: number;
};
