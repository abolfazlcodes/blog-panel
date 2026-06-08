import { updateData } from "@/core/http-service";
import type {
  ISeriesFormProps,
  TMutateSeriesResponse,
} from "@/types/series.types";
import { useMutation } from "@tanstack/react-query";

const updateSeries = async (id: number, data: ISeriesFormProps) => {
  return await updateData<TMutateSeriesResponse>(`/series/${id}`, data);
};

export const useUpdateSeries = () => {
  const mutation = useMutation({
    mutationKey: ["update-series"],
    mutationFn: ({ id, data }: { id: number; data: ISeriesFormProps }) =>
      updateSeries(id, data),
  });

  return { ...mutation, isUpdatingSeries: mutation?.isPending };
};
