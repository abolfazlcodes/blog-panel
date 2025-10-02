import { readData } from "@/core/http-service";
import type { TBlogsDataResponseProps } from "@/types/blogs.types";
import { useQuery } from "@tanstack/react-query";

const getBlogsList = async () => {
  return await readData<TBlogsDataResponseProps>("/blog");
};

export const useGetBlogs = () => {
  const { data, isPending } = useQuery({
    queryKey: ["blogs"],
    queryFn: getBlogsList,
  });

  return {
    isGettingBlogs: isPending,
    blogs: data?.data?.data,
  };
};
