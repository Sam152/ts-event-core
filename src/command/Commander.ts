import { AggregateRootDefinitionMap } from "../aggregate/AggregateRootDefinition.ts";

export type Commander<TAggregateMap extends AggregateRootDefinitionMap> = <
  TAggregateRootType extends keyof TAggregateMap,
  TCommandName extends keyof TAggregateMap[TAggregateRootType]["commands"],
>(args: {
  aggregateRootType: TAggregateRootType;
  aggregateRootId: string;
  command: TCommandName;
  data: Parameters<TAggregateMap[TAggregateRootType]["commands"][TCommandName]>[1];
}) => Promise<void>;
