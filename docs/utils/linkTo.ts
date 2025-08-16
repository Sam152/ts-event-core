export function linkTo({ path, linkName = "↗️" }: { path: string; linkName?: string }): string {
  // Get the absolute path on disk to ../..
  // If that path is at the start of the path variable, slice it off.
  // Return a markdown link.

  const projectRoot = new URL("../..", import.meta.url).pathname;
  const relativePath = path.startsWith(projectRoot) ? path.slice(projectRoot.length) : path;

  return `[${linkName}](${relativePath})`;
}
