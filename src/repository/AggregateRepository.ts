import { AggregateInstance } from "../aggregate/AggregateInstance.ts";

export type AggregateRepository = {
  retrieve: (type: AggregateInstance["type"], id: AggregateInstance["id"]) => Promise<AggregateInstance>;
  persist: (aggregate: AggregateInstance) => Promise<void>;
};
