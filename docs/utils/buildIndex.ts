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

  const counters: Record<number, number> = {};

  return headings
    .map(({ level, text, anchor }) => {
      const indent = "   ".repeat(level - minLevel);

      // Reset counters for deeper levels when we encounter a shallower level
      Object.keys(counters).forEach((key) => {
        const counterLevel = parseInt(key);
        if (counterLevel > level) {
          delete counters[counterLevel];
        }
      });

      // Increment counter for current level
      counters[level] = (counters[level] || 0) + 1;

      return `${indent}${counters[level]}. [${text}](#${anchor})`;
    })
    .join("\n");
}
