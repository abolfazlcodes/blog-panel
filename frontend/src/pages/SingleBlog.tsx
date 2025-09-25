import BlogTextEditor from "@/components/BlogTextEditor";
import { useState } from "react";

const SingleBlogPage = () => {
  const [content, setContent] = useState(`
      <h1>hello</h1>
      <blockquote>Nothing is impossible</blockquote>
    `);

  return (
    <main className="min-h-svh">
      <BlogTextEditor
        content={content}
        onChange={(editorContent) => setContent(editorContent)}
      />
    </main>
  );
};

export default SingleBlogPage;
