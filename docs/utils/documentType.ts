import { fileContainingGenericType } from "./fileContainingGenericType.ts";
import { getCallSites } from "node:util";
import { padAfterFirstLine } from "./padAfterFirstLine.ts";

/**
 * This function should:
 *
 * - Take filePath, read the contents of the file into a string.
 * - Scan the file line by line until the line contains the string: `type ${typeName}`.
 * - Read down until a line matching is found /^((\}\;)|(\>\;)/, that is the body of the type.
 * - Read up until /** is encountered, that is the docstring of the type.
 * - Create variables typeBody and docstring out of these components.
 */
export function documentType<TType>(): string {
  const { filePath, typeName } = fileContainingGenericType(getCallSites());

  const fileContents = Deno.readTextFileSync(filePath);
  const lines = fileContents.split("\n");

  const typeStartIndex = lines.findIndex((line) => line.includes(`type ${typeName}`));
  if (typeStartIndex === -1) {
    throw new Error(`Type ${typeName} not found in ${filePath}`);
  }
  const typeEndIndex = lines
    .slice(typeStartIndex + 1)
    .findIndex((line) => /^((\}\;)|(\>\;))/.test(line.trim())) + typeStartIndex + 1;
  if (typeEndIndex === typeStartIndex) {
    throw new Error(`Type ${typeName} end not found in ${filePath}`);
  }
  const typeBody = lines.slice(typeStartIndex, typeEndIndex + 1).join("\n");

  const docstringStartIndex = lines
    .slice(0, typeStartIndex)
    .reverse()
    .findIndex((line) => line.trim().includes("/**"));
  const actualDocstringStartIndex: number | undefined = docstringStartIndex !== -1
    ? typeStartIndex - 1 - docstringStartIndex
    : undefined;
  const docstring: string | undefined = actualDocstringStartIndex
    ? lines.slice(actualDocstringStartIndex, typeStartIndex).join("\n")
    : undefined;

  const output = docstring ? `${docstring}\n${typeBody}` : typeBody;

  return padAfterFirstLine({ count: 4, char: " " })(output);
}
