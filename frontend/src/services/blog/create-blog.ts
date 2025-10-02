import { createData } from "@/core/http-service";
import type {
  IBlogFormProps,
  TCreateBlogResponseProps,
} from "@/types/blogs.types";
import { useMutation } from "@tanstack/react-query";

const createBlog = async (data: IBlogFormProps) => {
  return await createData<TCreateBlogResponseProps>("blog", data);
};

export const useCreateBlog = () => {
  const mutation = useMutation({
    mutationKey: ["create-blog"],
    mutationFn: ({ data }: { data: IBlogFormProps }) => createBlog(data),
  });

  return {
    ...mutation,
    isCreatingBlog: mutation?.isPending,
  };
};
