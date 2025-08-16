import { getCallSites } from "node:util";
import { extractSymbolAndDocString } from "./extractSymbolAndDocString.ts";
import { filenameFromImportSymbol } from "./filenameFromImportSymbol.ts";
import { dirname, resolve } from "@std/path";
import { linkTo } from "./linkTo.ts";
import { formatDocString } from "./formatDocString.ts";
import { formatCode } from "./formatCode.ts";
import { padAfterFirstLine } from "./padAfterFirstLine.ts";

export function documentFunction(func: (...args: any) => unknown): string {
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
  components.push(formatFunctionBody(symbolBody));

  return padAfterFirstLine({ count: 4, char: " " })(components.join("\n\n"));
}

function formatFunctionBody(code: string) {
  return `


${"`"}blob${"`"}

<details>
<summary>:point_down: ${"`"}blo${"`"}</summary>

${formatCode(code)}

</details>
  `.trim();
}

function extractFunctionDefinition(code: string): string {
  const lines = code.split("\n");
  const endIndex = lines.findIndex((line) => line.endsWith(" {"));

  return (endIndex === -1 ? lines : lines.slice(0, endIndex + 1))
    .join("\n")
    .replace(/^export /, "")
    .replace(/ \{$/, "")
    .replace(/\n/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/\([^)]*\)/g, (match) => match === "()" ? "()" : "(...)")
    .trim();
}
