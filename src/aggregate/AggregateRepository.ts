import { AggregateInstance } from "../AggregateInstance.ts";

export type AggregateRepository = {
  retrieve: (
    args: { type: string; id: string },
  ) => Promise<AggregateInstance>;
  persist: (aggregate: AggregateInstance) => Promise<void>;
};
