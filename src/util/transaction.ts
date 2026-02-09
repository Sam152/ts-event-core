import { AsyncLocalStorage } from "node:async_hooks";
import type postgres from "postgres";

type PostgresConnection = ReturnType<typeof postgres>;

const transactionContext = new AsyncLocalStorage<PostgresConnection>();

export async function withTxn<T>(
  sql: PostgresConnection,
  fn: () => Promise<T>,
): Promise<T> {
  const txn = await sql.reserve();
  await txn`BEGIN`;
  try {
    const result = await transactionContext.run(txn, fn);
    await txn`COMMIT`;
    return result;
  } catch (error) {
    await txn`ROLLBACK`;
    throw error;
  } finally {
    txn.release();
  }
}

export function getTxn(fallback?: PostgresConnection): PostgresConnection {
  const txn = transactionContext.getStore();
  if (txn) {
    return txn;
  }
  if (fallback) {
    return fallback;
  }
  throw new Error("No transaction context or fallback connection available");
}
