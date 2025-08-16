import { fileContainingGenericType } from "./fileContainingGenericType.ts";
import { getCallSites } from "node:util";
import { padAfterFirstLine } from "./padAfterFirstLine.ts";
import { extractSymbolAndDocString } from "./extractSymbolAndDocString.ts";
import { pipe } from "./pipe.ts";

/**
 * This function should:
 *
 * - Take filePath, read the contents of the file into a string.
 * - Scan the file line by line until the line contains the string: `type ${typeName}`.
 * - Read down until a line matching is found /^((\}\;)|(\>\;)/, that is the body of the type.
 * - Read up until /** is encountered, that is the docstring of the type.
 * - Create variables typeBody and docstring out of these components.
 */
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

export function documentType<TType>() {
  return pipe(
    doDocumentType,
    padAfterFirstLine({ count: 4, char: " " }),
  )("");
}
