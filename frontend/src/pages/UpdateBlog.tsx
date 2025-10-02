import Cookies from "js-cookie";

import { Button } from "@/components/common/Button";
import BlogForm from "@/components/forms/BlogForm";
import { useGetSingleBlog } from "@/services/blog/blog-single";
import { useNavigate, useParams } from "react-router";
import { ClipLoader } from "react-spinners";

const UpdateBlog = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { blogData, isGettingBlog } = useGetSingleBlog(id);

  const handleLogin = () => {
    Cookies.remove("auth_token");
    navigate("/login");
  };

  if (isGettingBlog) {
    return (
      <main className="min-h-svh">
        <ClipLoader size={6} />
      </main>
    );
  }

  if (blogData) {
    return (
      <main className="min-h-svh">
        <BlogForm
          defaultValues={{
            id: `${blogData?.id}`,
            content: blogData?.content as string,
            cover_image: blogData?.cover_image,
            description: blogData?.description,
            short_description: blogData?.short_description,
            title: blogData?.title,
          }}
        />
      </main>
    );
  }

  if (!isGettingBlog && !blogData) {
    return (
      <main className="min-h-svh">
        <p>Something went wrong. Please log in again</p>
        <Button onClick={handleLogin}>Login </Button>
      </main>
    );
  }
};

export default UpdateBlog;
