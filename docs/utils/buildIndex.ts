export function buildIndex(markdown: string): string {
  const lines = markdown.split("\n");
  const headings: Array<{ level: number; text: string; anchor: string }> = [];

  lines.forEach((line) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2];
      const anchor = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      headings.push({ level, text, anchor });
    }
  });

  if (headings.length === 0) { return ""; }

  const minLevel = Math.min(...headings.map((h) => h.level));

  return headings
    .map(({ level, text, anchor }, index) => {
      const indent = "  ".repeat(level - minLevel);
      return `${indent}${index + 1}. [${text}](#${anchor})`;
    })
    .join("\n");
}
