import { deleteData } from "@/core/http-service";
import type { TDeleteBlogResponseProps } from "@/types/blogs.types";
import { useMutation } from "@tanstack/react-query";

const deleteBlog = async (id: string) => {
  return await deleteData<TDeleteBlogResponseProps>(`/blog/${id}`);
};

export const useDeleteBlog = () => {
  const mutation = useMutation({
    mutationKey: ["delete-blog"],
    mutationFn: ({ id }: { id: string }) => deleteBlog(id),
  });

  return {
    ...mutation,
    isDeleting: mutation?.isPending,
  };
};
