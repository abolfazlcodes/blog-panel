import { readData } from "@/core/http-service";
import type { TProjectsDataResponseProps } from "@/types/projects.types";
import { useQuery } from "@tanstack/react-query";

const getProjectsList = async () => {
  return await readData<TProjectsDataResponseProps>("/project");
};

export const useGetProjects = () => {
  const { data, isPending } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjectsList,
  });

  return {
    isGettingProjects: isPending,
    projects: data?.data?.data,
  };
};
