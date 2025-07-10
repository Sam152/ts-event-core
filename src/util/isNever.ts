export function isNever(_thing: never): never {
  throw new Error(`Encountered a value for never.`);
}
