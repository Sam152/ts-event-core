export function formatInlineCode(code: string) {
  const formatted = code.replace(/[\u00A0-\u9999<>\&]/g, function (i) {
    return "&#" + i.charCodeAt(0) + ";";
  });
  // Required instead of backticks, so that blocks work inside summary tags.
  return `<span>${"`"}${formatted}${"`"}</span>`;
}
