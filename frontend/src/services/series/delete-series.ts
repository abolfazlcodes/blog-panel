import { deleteData } from "@/core/http-service";
import { useMutation } from "@tanstack/react-query";

const deleteSeries = async (id: number) => {
  return await deleteData<TResponse<object>>(`/series/${id}`);
};

export const useDeleteSeries = () => {
  const mutation = useMutation({
    mutationKey: ["delete-series"],
    mutationFn: ({ id }: { id: number }) => deleteSeries(id),
  });

  return { ...mutation, isDeletingSeries: mutation?.isPending };
};
