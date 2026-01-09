import { useAuth } from "@/contexts/AuthContext";

const SUPERADMIN_EMAIL = "kenyashipment@gmail.com";

export const useSuperadmin = () => {
  const { user } = useAuth();
  const isSuperadmin = user?.email === SUPERADMIN_EMAIL;
  
  return { isSuperadmin, superadminEmail: SUPERADMIN_EMAIL };
};
