import { readData } from "@/core/http-service";
import type { TBlogsDataResponseProps } from "@/types/blogs.types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

interface IBlogsListParams {
  q?: string;
  page?: number;
}

const getBlogsList = async ({ q, page }: IBlogsListParams) => {
  return await readData<TBlogsDataResponseProps>("/blog", {
    params: { q: q || undefined, page },
  });
};

export const useGetBlogs = ({ q = "", page = 1 }: IBlogsListParams = {}) => {
  const { data, isPending } = useQuery({
    queryKey: ["blogs", { q, page }],
    queryFn: () => getBlogsList({ q, page }),
    placeholderData: keepPreviousData, // keep the old page visible while fetching
  });

  return {
    isGettingBlogs: isPending,
    blogs: data?.data?.data,
    meta: data?.data?.meta,
  };
};
