import { updateDataPartially } from "@/core/http-service";
import type { TCreateProjectResponseProps } from "@/types/projects.types";
import { useMutation } from "@tanstack/react-query";

const publishProject = async (id: string, shouldPublish: boolean) => {
  return await updateDataPartially<TCreateProjectResponseProps>(
    `/project/${id}`,
    {
      is_draft: shouldPublish,
    }
  );
};

export const usePublishProject = () => {
  const mutation = useMutation({
    mutationKey: ["publish-project"],
    mutationFn: ({
      id,
      shouldPublish,
    }: {
      id: string;
      shouldPublish: boolean;
    }) => publishProject(id, shouldPublish),
  });

  return {
    ...mutation,
    isUpdating: mutation?.isPending,
  };
};
