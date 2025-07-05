import { AggregateRootDefinitionMap } from "../aggregate/AggregateRootDefinition.ts";

export type Commander<TAggregateMap extends AggregateRootDefinitionMap> = <
  TAggregateType extends keyof TAggregateMap,
  TCommandName extends keyof TAggregateMap[TAggregateType]["commands"],
>(args: {
  aggregateType: TAggregateType;
  aggregateId: string;
  command: TCommandName;
  data: Parameters<TAggregateMap[TAggregateType]["commands"][TCommandName]>[1];
}) => Promise<void>;
