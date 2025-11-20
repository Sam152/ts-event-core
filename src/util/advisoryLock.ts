import type postgres from "postgres";

export async function advisoryLock(
  { id, connection }: { id: string; connection: ReturnType<typeof postgres> },
): Promise<() => Promise<void>> {
  const txn = await connection.reserve();
  // @todo - ID should be encoded into a bigint.
  await txn`BEGIN; SELECT pg_advisory_xact_lock(100)`.simple();
  return async () => {
    await txn`COMMIT`;
    txn.release();
  };
}
