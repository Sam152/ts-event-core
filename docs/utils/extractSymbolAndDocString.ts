type LineRef = `L${number}-L${number}`;

export function extractSymbolAndDocString(
  { symbolName, filePath, symbolType }: {
    symbolName: string;
    filePath: string;
    symbolType: string;
  },
): { docString: string | undefined; symbolBody: string; lineRef: LineRef } {
  const fileContents = Deno.readTextFileSync(filePath);
  const lines = fileContents.split("\n");

  const symbolStartIndex = lines.findIndex((line) => line.includes(`${symbolType} ${symbolName}`));
  if (symbolStartIndex === -1) {
    throw new Error(`${symbolType} ${symbolName} not found in ${filePath}`);
  }
  const symbolEndIndex = lines
    .slice(symbolStartIndex)
    .findIndex((line) => /^((\}\;?)|(\>\;))/.test(line)) + symbolStartIndex + 1;
  // if (symbolEndIndex === symbolStartIndex) {
  //   throw new Error(`${symbolType} ${symbolName} end not found in ${filePath}`);
  // }
  const symbolBody = lines.slice(symbolStartIndex, symbolEndIndex + 1).join("\n");

  const reversedDocstringIndex = lines
    .slice(0, symbolStartIndex)
    .reverse()
    .findIndex((line) => line.trim().includes("/**") || line === "");
  const docstringStartIndex: number | undefined = reversedDocstringIndex !== -1
    ? symbolStartIndex - 1 - reversedDocstringIndex
    : undefined;
  const docString: string | undefined = docstringStartIndex !== undefined
    ? lines.slice(docstringStartIndex, symbolStartIndex).join("\n")
    : undefined;

  return {
    docString,
    symbolBody,
    lineRef: `L${(docstringStartIndex || symbolStartIndex) + 1}-L${symbolEndIndex + 1}`,
  };
}
