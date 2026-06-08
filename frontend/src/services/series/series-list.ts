import { readData } from "@/core/http-service";
import type { TSeriesListResponse } from "@/types/series.types";
import { useQuery } from "@tanstack/react-query";

const getSeriesList = async () => {
  return await readData<TSeriesListResponse>("/series");
};

export const useGetSeries = () => {
  const { data, isPending } = useQuery({
    queryKey: ["series"],
    queryFn: getSeriesList,
  });

  return {
    isGettingSeries: isPending,
    series: data?.data?.data,
  };
};
