import { pipe } from "./pipe.ts";
import { trimCharsOffFirstLine } from "./trimCharsOffFirstLine.ts";

export const formatDocString = pipe(
  trimCharsOffFirstLine(3),
  (str: string) =>
    str
      .split("\n")
      .map((line) => line.trim())
      .filter((str) => !!str)
      .join("\n"),
  (str: string) => `${"`"}/**${"`"}\n${str}`,
);
