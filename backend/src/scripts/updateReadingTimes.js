import { PrismaClient } from "@prisma/client";
import readingTime from "reading-time";

export function extractPlainTextFromTiptap(contentJson) {
  if (!contentJson || !contentJson.content) return "";

  const traverse = (node) => {
    if (node.type === "text") return node.text || "";
    if (node.content && Array.isArray(node.content)) {
      return node.content.map(traverse).join(" ");
    }
    return "";
  };

  return contentJson.content.map(traverse).join(" ");
}

const prisma = new PrismaClient();

async function main() {
  const blogs = await prisma.blog.findMany();

  console.log(`Found ${blogs?.length} blogs. Updating reading times ...`);

  for (const blog of blogs) {
    try {
      // skip if already has
      if (blog?.reading_time) continue;

      let plainText = "";

      try {
        // Try parsing as JSON (Tiptap)
        const contentJSON = JSON.parse(blog?.content);
        plainText = extractPlainTextFromTiptap(contentJSON);
      } catch {
        // Fallback: assume it's HTML
        plainText =
          blog?.content
            ?.replace(/<[^>]+>/g, " ") // remove HTML tags
            ?.replace(/\s+/g, " ") // normalize spaces
            ?.trim() || "";
      }

      if (!plainText) {
        console.warn(`⚠️ No text extracted for blog #${blog.id}`);
        continue;
      }

      const stats = readingTime(plainText, {
        wordsPerMinute: 200,
      });

      await prisma.blog.update({
        where: {
          id: blog?.id,
        },
        data: {
          reading_time: stats?.minutes,
        },
      });

      console.log(
        `✅ Updated blog #${blog?.id} (${stats?.minutes?.toFixed(2)} min)`
      );
    } catch (error) {
      // @ts-ignore
      console.error(`⚠️ Error updating blog #${blog.id}:`, error?.message);
    }
  }

  console.log("🎉 All done!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
