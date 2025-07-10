import { AggregateRootDefinitionMap, AggregateRootDefinitionMapTypes, } from "../aggregate/AggregateRootDefinition.ts";

export type CommandIssuer<
  TAggregateRootDefinitionMap extends AggregateRootDefinitionMap<TAggregateMapTypes>,
  TAggregateMapTypes extends AggregateRootDefinitionMapTypes = AggregateRootDefinitionMapTypes,
> = <
  TAggregateRootType extends keyof TAggregateRootDefinitionMap,
  TCommandName extends keyof TAggregateRootDefinitionMap[TAggregateRootType]["commands"],
>(args: {
  aggregateRootType: TAggregateRootType;
  aggregateRootId: string;
  command: TCommandName;
  data: Parameters<TAggregateRootDefinitionMap[TAggregateRootType]["commands"][TCommandName]>[1];
}) => Promise<void>;
