import type postgres from "postgres";
import { createHash } from "node:crypto";

export async function advisoryLock(
  { id, connection }: { id: string; connection: ReturnType<typeof postgres> },
): Promise<() => Promise<void>> {
  const txn = await connection.reserve();
  // Hash the ID, to ensure it's plain, since this is passed directly into postgres without
  // parameterization.
  const hashedId = createHash("md5").update(id).digest("hex");
  await txn`BEGIN; SELECT pg_advisory_xact_lock(('x' || md5('${hashedId}'))::bit(64)::bigint);`.simple();
  return async () => {
    await txn`COMMIT`;
    txn.release();
  };
}
