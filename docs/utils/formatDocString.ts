import { pipe } from "./pipe.ts";
import { trimCharsOffFirstLine } from "./trimCharsOffFirstLine.ts";

export const formatDocString = pipe(
  trimCharsOffFirstLine(3),
  (str: string) =>
    str
      .split("\n")
      .slice(1, -1)
      .join("\n"),
  (str: string) => `${"`"}/**${"`"}\n${str}`,
);
