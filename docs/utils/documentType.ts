import { fileContainingGenericType } from "./fileContainingGenericType.ts";
import { getCallSites } from "node:util";

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



  return `${typeName}: ${filePath}`;
}
