import { readData } from "@/core/http-service";
import type { TSingleBlogDataResponseProps } from "@/types/blogs.types";
import { useQuery } from "@tanstack/react-query";

const getSingleProject = async (projectId: string | undefined) => {
  return await readData<TSingleBlogDataResponseProps>(`/project/${projectId}`);
};

export const useGetSingleProject = (id: string | undefined) => {
  const { data, isPending } = useQuery({
    queryKey: ["project", id],
    queryFn: () => getSingleProject(id),
    enabled: !!id,
  });

  return {
    isGettingProject: isPending,
    projectData: data?.data?.data,
  };
};
