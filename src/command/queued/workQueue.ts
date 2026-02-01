import type postgres from "postgres";
import { wait } from "../../../test/integration/utils/wait.ts";
import { runPendingCommandFromQueue } from "./runPendingCommandFromQueue.ts";

export type QueueSignal = { status: "WORKING" | "HALTED" };

export async function workQueue(
  { signal, sql }: { signal: QueueSignal; sql: ReturnType<typeof postgres> },
) {
  while (signal.status === "WORKING") {
    await runPendingCommandFromQueue({ sql });
    await wait(5);
  }
}
