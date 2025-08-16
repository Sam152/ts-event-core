import { fileContainingGenericType } from "./fileContainingGenericType.ts";
import { getCallSites } from "node:util";

export function documentType<TType>(): string {
  const { fileName, typeName } = fileContainingGenericType(getCallSites());

  //
  return `${typeName}: ${fileName}`;
}
