import { readData } from "@/core/http-service";
import type { TProjectsDataResponseProps } from "@/types/projects.types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

interface IProjectsListParams {
  q?: string;
  page?: number;
}

const getProjectsList = async ({ q, page }: IProjectsListParams) => {
  return await readData<TProjectsDataResponseProps>("/project", {
    params: { q: q || undefined, page },
  });
};

export const useGetProjects = ({
  q = "",
  page = 1,
}: IProjectsListParams = {}) => {
  const { data, isPending } = useQuery({
    queryKey: ["projects", { q, page }],
    queryFn: () => getProjectsList({ q, page }),
    placeholderData: keepPreviousData, // keep the old page visible while fetching
  });

  return {
    isGettingProjects: isPending,
    projects: data?.data?.data,
    meta: data?.data?.meta,
  };
};
