import BlogTextEditor from "@/components/common/BlogTextEditor";
import { useGetSingleBlog } from "@/services/blog/blog-single";
import { useState } from "react";
import { useParams } from "react-router";
import { ClipLoader } from "react-spinners";

const UpdateBlog = () => {
  const { id } = useParams();
  const { blogData, isGettingBlog } = useGetSingleBlog(id);
  const [content, setContent] = useState("");

  console.log(content, "new content", blogData?.content);

  return (
    <main className="min-h-svh">
      {isGettingBlog ? (
        <ClipLoader size={6} />
      ) : (
        <BlogTextEditor
          content={blogData?.content as string}
          onChange={(editorContent) => setContent(editorContent)}
        />
      )}
    </main>
  );
};

export default UpdateBlog;
