import { readData } from "@/core/http-service";
import type { TSingleBlogDataResponseProps } from "@/types/blogs.types";
import { useQuery } from "@tanstack/react-query";

const getSingleBlog = async (blogId: string | undefined) => {
  return await readData<TSingleBlogDataResponseProps>(`/blog/${blogId}`);
};

export const useGetSingleBlog = (id: string | undefined) => {
  const { data, isPending } = useQuery({
    queryKey: ["blog", id],
    queryFn: () => getSingleBlog(id),
    enabled: !!id,
  });

  return {
    isGettingBlog: isPending,
    blogData: data?.data?.data,
  };
};
