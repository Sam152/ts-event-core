import { fileContainingGenericType } from "./fileContainingGenericType.ts";
import { getCallSites } from "node:util";
import { padAfterFirstLine } from "./padAfterFirstLine.ts";
import { extractSymbolAndDocString } from "./extractSymbolAndDocString.ts";
import { formatDocString } from "./formatDocString.ts";
import { formatCode } from "./formatCode.ts";
import { linkTo } from "./linkTo.ts";

export function documentType<TType>(): string {
  const { filePath, typeName } = fileContainingGenericType({
    callSites: getCallSites(),
    depth: 0,
  });
  const { docString, symbolBody, lineRef } = extractSymbolAndDocString({
    filePath,
    symbolName: typeName,
    symbolType: "type",
  });

  if (!docString) {
    throw new Error(`Could not extract doc string for type ${typeName} in ${filePath}`);
  }

  return formatDocString(docString);
}

export function documentTypeWithCode<TType>(): string {
  const { filePath, typeName } = fileContainingGenericType({
    callSites: getCallSites(),
    depth: 0,
  });
  const { docString, symbolBody, lineRef } = extractSymbolAndDocString({
    filePath,
    symbolName: typeName,
    symbolType: "type",
  });

  const components: string[] = [];
  if (docString) {
    components.push(`${linkTo({ path: `${filePath}#${lineRef}` })} ${formatDocString(docString)}`);
  }
  components.push(formatCode(symbolBody));

  return padAfterFirstLine({ count: 4, char: " " })(components.join("\n\n"));
}

export function linkType<TType>(): string {
  const { filePath, typeName } = fileContainingGenericType({
    callSites: getCallSites(),
    depth: 0,
  });
  return linkTo({
    path: filePath,
    linkName: `\`${typeName}\``,
  });
}
