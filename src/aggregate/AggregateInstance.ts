import { AggregateRootDefinition } from "./AggregateRootDefinition.ts";

export type AggregateInstance<TAggregateDefinition extends AggregateRootDefinition<any, any>> = {
  id: string;
  type: string;
};
