import { readData } from "@/core/http-service";
import type { TProfileResponseProps } from "@/types/profile.types";
import { useQuery } from "@tanstack/react-query";

const getProfileData = async () => {
  return await readData<TProfileResponseProps>("/profile");
};

export const useGetProfile = () => {
  const { data, isPending } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfileData,
  });

  return {
    isGettingUserInfo: isPending,
    userInfo: data?.data?.data,
  };
};
