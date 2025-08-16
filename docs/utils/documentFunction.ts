import { getCallSites } from "node:util";
import { extractSymbolAndDocString } from "./extractSymbolAndDocString.ts";
import { filenameFromImportSymbol } from "./filenameFromImportSymbol.ts";
import { dirname, resolve } from "@std/path";
import { linkTo } from "./linkTo.ts";
import { formatDocString } from "./formatDocString.ts";
import { formatCode } from "./formatCode.ts";
import { padAfterFirstLine } from "./padAfterFirstLine.ts";

export function documentFunction(func: () => unknown): string {
  const filePath = resolve(
    dirname(getCallSites()[1].scriptName),
    filenameFromImportSymbol({
      fileContents: Deno.readTextFileSync(getCallSites()[1].scriptName),
      symbolName: func.name,
    }),
  );
  const { docString, symbolBody, lineRef } = extractSymbolAndDocString({
    filePath,
    symbolName: func.name,
    symbolType: "function",
  });

  const components: string[] = [];
  if (docString) {
    components.push(`${linkTo({ path: `${filePath}#${lineRef}` })} ${formatDocString(docString)}`);
  }
  components.push(formatCode(symbolBody));

  return padAfterFirstLine({ count: 4, char: " " })(components.join("\n\n"));
}
