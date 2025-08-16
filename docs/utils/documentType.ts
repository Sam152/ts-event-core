import { fileContainingGenericType } from "./fileContainingGenericType.ts";
import { getCallSites } from "node:util";
import { padAfterFirstLine } from "./padAfterFirstLine.ts";
import { extractSymbolAndDocString } from "./extractSymbolAndDocString.ts";
import { pipe } from "./pipe.ts";
import { formatDocString } from "./formatDocString.ts";

function doDocumentType<TType>(): string {
  const { filePath, typeName } = fileContainingGenericType({
    callSites: getCallSites(),
    depth: 2,
  });
  const { docString, symbolBody } = extractSymbolAndDocString({
    filePath,
    symbolName: typeName,
    symbolType: "type",
  });

  const components: string[] = [];

  if (docString) {
    components.push(formatDocString(docString));
  }

  return components.join("\n");
}

/**
 * Padded to align with existing Readme indent.
 */
export const documentType = <TType>() =>
  pipe(
    doDocumentType,
    padAfterFirstLine({ count: 4, char: " " }),
  )("");
