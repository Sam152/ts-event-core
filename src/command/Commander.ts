import { AggregateMapTypes, AggregateRootDefinitionMap } from "../aggregate/AggregateRootDefinition.ts";

export type Commander<
  TAggregateRootDefinitionMap extends AggregateRootDefinitionMap<TAggregateMapTypes>,
  TAggregateMapTypes extends AggregateMapTypes = AggregateMapTypes,
> = <
  TAggregateRootType extends keyof TAggregateRootDefinitionMap,
  TCommandName extends keyof TAggregateRootDefinitionMap[TAggregateRootType]["commands"],
>(args: {
  aggregateRootType: TAggregateRootType;
  aggregateRootId: string;
  command: TCommandName;
  data: Parameters<TAggregateRootDefinitionMap[TAggregateRootType]["commands"][TCommandName]>[1];
}) => Promise<void>;
