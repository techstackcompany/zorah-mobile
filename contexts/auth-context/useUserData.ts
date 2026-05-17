import { useGetUserProfileQuery } from "@/src/api/hooks";

const useUserData = () => {
  const { data } = useGetUserProfileQuery();
  return data ?? null;
};

export default useUserData;
