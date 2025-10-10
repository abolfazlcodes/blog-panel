import { createData } from "@/core/http-service";
import type {
  IProjectFormProps,
  TCreateProjectResponseProps,
} from "@/types/projects.types";

import { useMutation } from "@tanstack/react-query";

const createProject = async (data: IProjectFormProps) => {
  return await createData<TCreateProjectResponseProps>("/project", data);
};

export const useCreateProject = () => {
  const mutation = useMutation({
    mutationKey: ["create-project"],
    mutationFn: ({ data }: { data: IProjectFormProps }) => createProject(data),
  });

  return {
    ...mutation,
    isCreatingProject: mutation?.isPending,
  };
};
