import sanitizeHtml from "sanitize-html";

export function sanitizeRichTextContent(content: string) {
  const sanitizedContent = sanitizeHtml(content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt"],
    },
    exclusiveFilter: (frame) => {
      return frame.tag === "script";
    },
    textFilter: (text) => {
      return text.replace(/\s+/g, " ").trim();
    },
  });

  return sanitizedContent;
}
