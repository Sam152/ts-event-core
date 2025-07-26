export function trimCharsOffFirstLine(numberOfChars: number) {
  return (str: string): string => {
    return str
      .split('\n')
      .map(line => line.slice(numberOfChars))
      .join('\n');
  };
}
