import { updateDataPartially } from "@/core/http-service";
import type { TCreateBlogResponseProps } from "@/types/blogs.types";
import { useMutation } from "@tanstack/react-query";

const publishBlog = async (id: string) => {
  return await updateDataPartially<TCreateBlogResponseProps>(`/blog/${id}`, {
    is_draft: true,
  });
};

export const usePublishBlog = () => {
  const mutation = useMutation({
    mutationKey: ["publish-blog"],
    mutationFn: ({ id }: { id: string }) => publishBlog(id),
  });

  return {
    ...mutation,
    isUpdating: mutation?.isPending,
  };
};
