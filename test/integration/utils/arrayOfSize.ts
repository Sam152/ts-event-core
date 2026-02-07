export const arrayOfSize = <T>(size: number, fn: (i: number) => T): T[] =>
  Array.from({ length: size }, (_, i) => fn(i));
