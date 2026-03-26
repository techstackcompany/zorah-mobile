import { useSession } from "./useSession";

const useUserData = () => {
  const { userData } = useSession();
  return userData;
};

export default useUserData;
