import { assertEquals } from "@std/assert";
import { wait } from "../../src/util/wait.ts";

export async function tryAssertEquals(...args: Parameters<typeof assertEquals>) {
  let status: "TRYING" | "TIMEOUT_EXCEEDED" | "SUCCEEDED" = "TRYING";

  const timer = setInterval(() => {
    status = "TIMEOUT_EXCEEDED";
  }, 500);

  while (status !== "SUCCEEDED") {
    try {
      assertEquals(...args);
      status = "SUCCEEDED";
    } catch (e) {
      if (status === "TIMEOUT_EXCEEDED") {
        throw e;
      }
      await wait(3);
    }
  }
  clearInterval(timer);
}
