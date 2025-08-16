export function filenameFromImportSymbol(
  { fileContents, symbolName }: { fileContents: string; symbolName: string },
) {
  const importMatch = fileContents.match(
    new RegExp(
      `import\\s+{[^}]*${symbolName}[^}]*}\\s+from\\s+["'](?<filename>[^"']+)["']`,
    ),
  );

  if (!importMatch || !importMatch.groups?.filename) {
    throw new Error();
  }

  return importMatch.groups.filename;
}
