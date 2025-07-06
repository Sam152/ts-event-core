import { AggregateRootDefinition } from "./AggregateRootDefinition.ts";

export type LoadedAggregateRoot<TAggregateDefinition extends AggregateRootDefinition> = {
  id: string;
  type: string;
};
