import { updateData } from "@/core/http-service";
import type {
  IProjectFormProps,
  TCreateProjectResponseProps,
} from "@/types/projects.types";
import { useMutation } from "@tanstack/react-query";

const updateProject = async (id: string, data: IProjectFormProps) => {
  return await updateData<TCreateProjectResponseProps>(`/project/${id}`, data);
};

export const useUpdateProject = () => {
  const mutation = useMutation({
    mutationKey: ["update-project"],
    mutationFn: ({ data, id }: { data: IProjectFormProps; id: string }) =>
      updateProject(id, data),
  });

  return {
    ...mutation,
    isUpdating: mutation?.isPending,
  };
};
