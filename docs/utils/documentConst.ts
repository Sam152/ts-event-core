import { getCallSites } from "node:util";
import { extractSymbolAndDocString } from "./extractSymbolAndDocString.ts";
import { filenameFromImportSymbol } from "./filenameFromImportSymbol.ts";
import { dirname, resolve } from "@std/path";
import { linkTo } from "./linkTo.ts";
import { formatDocString } from "./formatDocString.ts";
import { formatCode } from "./formatCode.ts";
import { padAfterFirstLine } from "./padAfterFirstLine.ts";

export function documentConstWithCode(_constToDocument: unknown): string {
  const constName = getConstNameFromCallSite();
  const callSite = getCallSites()[1];

  const filePath = resolve(
    dirname(callSite.scriptName),
    filenameFromImportSymbol({
      fileContents: Deno.readTextFileSync(callSite.scriptName),
      symbolName: constName,
    }),
  );

  const { docString, symbolBody, lineRef } = extractSymbolAndDocString({
    filePath,
    symbolName: constName,
    symbolType: "const",
  });

  const components: string[] = [];
  if (docString) {
    components.push(`${formatDocString(docString)} ${linkTo({ path: `${filePath}#${lineRef}` })}`);
  }
  components.push(formatCode(symbolBody));

  return padAfterFirstLine({ count: 4, char: " " })(components.join("\n\n"));
}

function getConstNameFromCallSite(): string {
  const callSite = getCallSites()[2];
  const fileContents = Deno.readTextFileSync(callSite.scriptName);
  const lines = fileContents.split("\n");
  const callLine = lines[callSite.lineNumber - 1];

  const match = callLine.match(/documentConst(?:WithCode)?\(([^)]+)\)/);
  if (!match) {
    throw new Error(`Could not extract const name from call site: ${callLine}`);
  }

  return match[1].trim();
}
