export function extractPlainTextFromTiptap(contentJson: any): string {
  if (!contentJson || !contentJson.content) return "";

  const traverse = (node: any): string => {
    if (node.type === "text") return node.text || "";
    if (node.content && Array.isArray(node.content)) {
      return node.content.map(traverse).join(" ");
    }
    return "";
  };

  return contentJson.content.map(traverse).join(" ");
}

export function extractPlainText(contentHtml: any): string {
  let plainText = "";

  try {
    const contentJSON = JSON.parse(contentHtml);
    plainText = extractPlainTextFromTiptap(contentJSON);
  } catch {
    // Fallback: assume it's HTML
    plainText =
      contentHtml
        ?.replace(/<[^>]+>/g, " ") // remove HTML tags
        ?.replace(/\s+/g, " ") // normalize spaces
        ?.trim() || "";
  }

  return plainText;
}
