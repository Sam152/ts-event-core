import type postgres from "postgres";

export async function advisoryLock(
  { id, connection }: { id: string; connection: ReturnType<typeof postgres> },
): Promise<() => Promise<void>> {
  const txn = await connection.reserve();
  await txn`BEGIN; SELECT pg_advisory_xact_lock(('x' || md5('${id}'))::bit(64)::bigint);`.simple();
  return async () => {
    await txn`COMMIT`;
    txn.release();
  };
}
