import { AggregateDefinitionMap } from "../aggregate/AggregateDefinition.ts";

export type CommandIssuer<TAggregateMap extends AggregateDefinitionMap> = <
  TAggregateType extends keyof TAggregateMap,
  TCommandName extends keyof TAggregateMap[TAggregateType]["commands"],
>(args: {
  aggregateType: TAggregateType;
  aggregateId: string;
  command: TCommandName;
  data: Parameters<TAggregateMap[TAggregateType]["commands"][TCommandName]>[1];
}) => Promise<void>;
