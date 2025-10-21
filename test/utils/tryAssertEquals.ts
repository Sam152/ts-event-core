import { assertEquals } from "@std/assert";

export function tryAssertEquals(...args: Parameters<typeof assertEquals>) {
    assertEquals(...args);
}