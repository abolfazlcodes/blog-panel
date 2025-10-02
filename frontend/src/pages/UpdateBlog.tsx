import BlogTextEditor from "@/components/common/BlogTextEditor";
import { useState } from "react";

const UpdateBlog = () => {
  const [content, setContent] = useState(`
      <h1>hello</h1>
      <blockquote>Nothing is impossible</blockquote>
    `);
  console.log(content);

  return (
    <main className="min-h-svh">
      <BlogTextEditor
        content={content}
        onChange={(editorContent) => setContent(editorContent)}
      />
    </main>
  );
};

export default UpdateBlog;
