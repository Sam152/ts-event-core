export async function repeat(times: number, fn: () => Promise<unknown> | unknown) {
  for (let i = 0; i < times; i++) {
    await fn();
  }
}
