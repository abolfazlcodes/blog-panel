import { useGetBlogs } from "@/services/blog/blogs-list";
import BlogCard from "../common/BlogCard";
import { ClipLoader } from "react-spinners";

const BlogsSection = () => {
  const { blogs, isGettingBlogs } = useGetBlogs();

  if (isGettingBlogs) {
    <section className="flex items-center justify-center p-2 my-10">
      <ClipLoader size={6} />
    </section>;
  }

  if (!blogs || blogs?.length === 0) {
    return (
      <section className="flex items-center justify-center p-2 my-10">
        no blog exists. please start writing
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2 my-10">
      {blogs?.map((blogItem) => (
        <BlogCard key={blogItem?.id} {...blogItem} />
      ))}
    </section>
  );
};

export default BlogsSection;
