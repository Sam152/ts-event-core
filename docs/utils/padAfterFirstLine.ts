export function padAfterFirstLine({ count, char }: {
  count: number;
  char: string;
}) {
  return (str: string): string => {
    return str
      .split("\n")
      .map((line, index) => index === 0 ? line : `${char.repeat(count)}${line}`)
      .join("\n");
  };
}
