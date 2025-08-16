import { fileContainingGenericType } from "./fileContainingGenericType.ts";
import { getCallSites } from "node:util";
import { padAfterFirstLine } from "./padAfterFirstLine.ts";
import { extractSymbolAndDocString } from "./extractSymbolAndDocString.ts";
import { pipe } from "./pipe.ts";

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

  return docString ? `${docString}\n\n\n${symbolBody}` : symbolBody;
}

/**
 * Padded to align with existing Readme indent.
 */
export const documentType = <TType>() =>
  pipe(
    doDocumentType,
    padAfterFirstLine({ count: 4, char: " " }),
  )("");
