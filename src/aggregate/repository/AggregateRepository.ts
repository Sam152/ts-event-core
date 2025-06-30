import { AggregateInstance } from "../AggregateInstance.ts";

export type AggregateRepository = {
  retrieve: (
    args: { type: AggregateInstance["type"]; id: AggregateInstance["id"] },
  ) => Promise<AggregateInstance>;
  persist: (aggregate: AggregateInstance) => Promise<void>;
};
