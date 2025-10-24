import { deleteData } from "@/core/http-service";
import type { TDeleteProjectResponseProps } from "@/types/projects.types";
import { useMutation } from "@tanstack/react-query";

const deleteProject = async (id: string) => {
  return await deleteData<TDeleteProjectResponseProps>(`/project/${id}`);
};

export const useDeleteProject = () => {
  const mutation = useMutation({
    mutationKey: ["delete-project"],
    mutationFn: ({ id }: { id: string }) => deleteProject(id),
  });

  return {
    ...mutation,
    isDeleting: mutation?.isPending,
  };
};
