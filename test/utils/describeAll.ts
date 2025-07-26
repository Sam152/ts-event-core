import { describe } from "jsr:@std/testing/bdd";

export function describeAll<TVariant>(
  thing: string,
  variants: TVariant[],
  testCases: (variant: TVariant) => void,
) {
  variants.forEach((variant, i) => {
    describe(`${thing} (${i})`, () => {
      testCases(variant);
    });
  });
}
