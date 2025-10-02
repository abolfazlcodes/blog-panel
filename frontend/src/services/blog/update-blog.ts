import { updateData } from "@/core/http-service";
import type {
  IBlogFormProps,
  TCreateBlogResponseProps,
} from "@/types/blogs.types";
import { useMutation } from "@tanstack/react-query";

const updateBlog = async (id: string, data: IBlogFormProps) => {
  return await updateData<TCreateBlogResponseProps>(`/blog/${id}`, data);
};

export const useUpdateBlog = () => {
  const mutation = useMutation({
    mutationKey: ["create-blog"],
    mutationFn: ({ data, id }: { data: IBlogFormProps; id: string }) =>
      updateBlog(id, data),
  });

  return {
    ...mutation,
    isUpdating: mutation?.isPending,
  };
};
