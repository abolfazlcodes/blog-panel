import { createData } from "@/core/http-service";
import type {
  ISeriesFormProps,
  TMutateSeriesResponse,
} from "@/types/series.types";
import { useMutation } from "@tanstack/react-query";

const createSeries = async (data: ISeriesFormProps) => {
  return await createData<TMutateSeriesResponse>("/series", data);
};

export const useCreateSeries = () => {
  const mutation = useMutation({
    mutationKey: ["create-series"],
    mutationFn: ({ data }: { data: ISeriesFormProps }) => createSeries(data),
  });

  return { ...mutation, isCreatingSeries: mutation?.isPending };
};
