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
