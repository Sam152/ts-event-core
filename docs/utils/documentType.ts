import { fileContainingGenericType } from "./fileContainingGenericType.ts";
import { getCallSites } from "node:util";
import { padAfterFirstLine } from "./padAfterFirstLine.ts";
import { extractSymbolAndDocString } from "./extractSymbolAndDocString.ts";
import { pipe } from "./pipe.ts";
import { formatDocString } from "./formatDocString.ts";
import { formatCode } from "./formatCode.ts";
import { linkTo } from "./linkTo.ts";

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
    components.push(`${linkTo({ path: filePath })} ${formatDocString(docString)}`);
  }

  components.push(formatCode(symbolBody));

  return components.join("\n\n");
}

/**
 * Padded to align with existing Readme indent.
 */
export const documentType = <TType>() =>
  pipe(
    doDocumentType,
    padAfterFirstLine({ count: 4, char: " " }),
  )("");
