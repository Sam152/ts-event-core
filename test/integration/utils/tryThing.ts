import { wait } from "./wait.ts";

export async function tryThing(thing: () => unknown) {
  let status: "TRYING" | "TIMEOUT_EXCEEDED" | "SUCCEEDED" = "TRYING";

  const timer = setInterval(() => {
    status = "TIMEOUT_EXCEEDED";
  }, 500);

  while (status !== "SUCCEEDED") {
    try {
      thing();
      status = "SUCCEEDED";
    } catch (e) {
      // @ts-ignore - Is this a bug in typescript narrowing?
      if (status === "TIMEOUT_EXCEEDED") {
        throw e;
      }
      await wait(3);
    }
  }
  clearInterval(timer);
}
