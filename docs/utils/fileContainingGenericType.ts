import { CallSiteObject } from "node:util";
import { dirname, resolve } from "@std/path";

/**
 * Get the file containing a given generic type, given some callsites.
 */
export function fileContainingGenericType(
  { callSites, depth }: { callSites: CallSiteObject[]; depth: number },
): { filePath: string; typeName: string } {
  const callingFunctionName = callSites[depth].functionName;
  const callingFunctionCallerFileContents = Deno.readTextFileSync(callSites[depth + 1].scriptName);
  const callingLine = callingFunctionCallerFileContents.split("\n")[callSites[depth + 1].lineNumber - 1];

  const genericNameMatch = callingLine.match(
    new RegExp(`${callingFunctionName}<(?<genericName>[A-Za-z0-9]+)>`),
  );
  if (!genericNameMatch) {
    throw new Error();
  }
  const genericName = genericNameMatch.groups?.genericName;
  if (!genericName) {
    throw new Error();
  }

  const importMatch = callingFunctionCallerFileContents.match(
    new RegExp(
      `import\\s+{[^}]*${genericName}[^}]*}\\s+from\\s+["'](?<filename>[^"']+)["']`,
    ),
  );

  if (!importMatch || !importMatch.groups?.filename) {
    throw new Error();
  }

  return {
    filePath: resolve(dirname(callSites[depth + 1].scriptName), importMatch.groups.filename),
    typeName: genericName,
  };
}
