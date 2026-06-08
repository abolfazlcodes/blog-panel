import { useCallback, useState } from "react";
import { ClipLoader } from "react-spinners";

import { useGetBlogs } from "@/services/blog/blogs-list";
import BlogCard from "../common/BlogCard";
import SearchInput from "../common/SearchInput";
import Pagination from "../common/Pagination";

const BlogsSection = () => {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const { blogs, isGettingBlogs, meta } = useGetBlogs({ q, page });

  // New searches reset to the first page.
  const handleSearch = useCallback((value: string) => {
    setQ(value);
    setPage(1);
  }, []);

  return (
    <div className="p-2">
      <div className="my-4 flex justify-center md:justify-start">
        <SearchInput onSearch={handleSearch} placeholder="Search blogs…" />
      </div>

      {isGettingBlogs ? (
        <section className="my-10 flex items-center justify-center">
          <ClipLoader size={20} />
        </section>
      ) : !blogs || blogs.length === 0 ? (
        <section className="my-10 flex items-center justify-center">
          {q ? "No blogs match your search." : "No blog exists. Please start writing."}
        </section>
      ) : (
        <>
          <section className="my-5 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blogItem) => (
              <BlogCard key={blogItem?.id} {...blogItem} />
            ))}
          </section>

          <Pagination
            page={meta?.page ?? page}
            totalPages={meta?.totalPages ?? 1}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
};

export default BlogsSection;
