import sanitizeHtml from "sanitize-html";

import { addHeadingIds } from "./add-heading-ids.js";

/**
 * Sanitizes editor HTML for storage, then injects heading anchor ids.
 *
 * Beyond the safe defaults we deliberately KEEP the metadata that downstream
 * sites need to reproduce the old portfolio's features:
 *  - `class` on <pre>/<code>/<span> → code language (`language-*`) + highlight
 *    tokens (`hljs-*`) survive, so syntax highlighting is preserved.
 *  - `id` on headings → section anchors / "on this page" links.
 * Whitespace inside code is preserved (indentation/newlines); prose is tidied.
 */
export function sanitizeRichTextContent(content: string) {
  const sanitizedContent = sanitizeHtml(content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt"],
      code: ["class"],
      pre: ["class"],
      span: ["class"],
      h1: ["id"],
      h2: ["id"],
      h3: ["id"],
      h4: ["id"],
      h5: ["id"],
      h6: ["id"],
    },
    // Restrict which classes survive to highlighting-related ones only.
    allowedClasses: {
      code: ["language-*", "hljs", "hljs-*"],
      pre: ["language-*", "hljs", "hljs-*"],
      span: ["hljs", "hljs-*"],
    },
    exclusiveFilter: (frame) => {
      return frame.tag === "script";
    },
    textFilter: (text, tagName) => {
      // Keep code formatting + highlight tokens intact.
      if (tagName === "code" || tagName === "pre" || tagName === "span") {
        return text;
      }
      // Collapse runs of whitespace in prose, but do NOT trim — trimming each
      // text node would eat the spaces around inline elements (links, bold, …).
      return text.replace(/\s+/g, " ");
    },
  });

  return addHeadingIds(sanitizedContent);
}
