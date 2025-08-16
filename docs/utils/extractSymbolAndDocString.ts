export function extractSymbolAndDocString(
  { symbolName, filePath, symbolType }: { symbolName: string; filePath: string; symbolType: string },
): { docString: string | undefined; symbolBody: string } {
  const fileContents = Deno.readTextFileSync(filePath);
  const lines = fileContents.split("\n");

  const typeStartIndex = lines.findIndex((line) => line.includes(`${symbolType} ${symbolName}`));
  if (typeStartIndex === -1) {
    throw new Error(`${symbolType} ${symbolName} not found in ${filePath}`);
  }
  const typeEndIndex = lines
    .slice(typeStartIndex + 1)
    .findIndex((line) => /^((\}\;)|(\>\;))/.test(line.trim())) + typeStartIndex + 1;
  if (typeEndIndex === typeStartIndex) {
    throw new Error(`${symbolType} ${symbolName} end not found in ${filePath}`);
  }
  const symbolBody = lines.slice(typeStartIndex, typeEndIndex + 1).join("\n");

  const reversedDocstringIndex = lines
    .slice(0, typeStartIndex)
    .reverse()
    .findIndex((line) => line.trim().includes("/**"));
  const docstringStartIndex: number | undefined = reversedDocstringIndex !== -1
    ? typeStartIndex - 1 - reversedDocstringIndex
    : undefined;
  const docString: string | undefined = docstringStartIndex
    ? lines.slice(docstringStartIndex, typeStartIndex).join("\n")
    : undefined;

  return { docString, symbolBody };
}
