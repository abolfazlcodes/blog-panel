import { parse } from "node-html-parser";
import slugify from "slugify";

/**
 * Injects slugified `id` attributes onto every heading so consuming sites can
 * build a table of contents and anchor-link to sections. Ids are made unique
 * within the document (duplicate headings get a numeric suffix).
 */
export function addHeadingIds(content: string): string {
  if (!content) return content;

  const root = parse(content);
  const used = new Map<string, number>();

  for (const heading of root.querySelectorAll("h1, h2, h3, h4, h5, h6")) {
    const base =
      slugify.default(heading.text ?? "", { lower: true, strict: true }) || "section";
    const count = used.get(base) ?? 0;
    used.set(base, count + 1);
    heading.setAttribute("id", count === 0 ? base : `${base}-${count}`);
  }

  return root.toString();
}
