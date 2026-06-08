import slugify from "slugify";

/** URL-safe slug: lowercase, ASCII-only, punctuation stripped. */
export function toSlug(text: string): string {
  return slugify.default(text ?? "", { lower: true, strict: true });
}
