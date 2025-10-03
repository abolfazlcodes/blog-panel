import { updateDataPartially } from "@/core/http-service";
import type { TCreateBlogResponseProps } from "@/types/blogs.types";
import { useMutation } from "@tanstack/react-query";

const publishBlog = async (id: string, shouldPublish: boolean) => {
  return await updateDataPartially<TCreateBlogResponseProps>(`/blog/${id}`, {
    is_draft: shouldPublish,
  });
};

export const usePublishBlog = () => {
  const mutation = useMutation({
    mutationKey: ["publish-blog"],
    mutationFn: ({
      id,
      shouldPublish,
    }: {
      id: string;
      shouldPublish: boolean;
    }) => publishBlog(id, shouldPublish),
  });

  return {
    ...mutation,
    isUpdating: mutation?.isPending,
  };
};
