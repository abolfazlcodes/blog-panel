import { readData } from "@/core/http-service";
import type { TTagListResponse } from "@/types/tags.types";
import { useQuery } from "@tanstack/react-query";

const getTagsList = async () => {
  return await readData<TTagListResponse>("/tag");
};

/** All of the current user's tags — used to power form autocomplete. */
export const useGetTags = () => {
  const { data, isPending } = useQuery({
    queryKey: ["tags"],
    queryFn: getTagsList,
  });

  return {
    isGettingTags: isPending,
    tags: data?.data?.data,
  };
};
