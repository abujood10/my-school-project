"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getServerPB } from "@/lib/serverAuth";
const pb = await getServerPB();



/* ====== أنواع البيانات ====== */
type Profile = {
  id: string;
  role: "super_admin" | "school_admin" | "teacher" | "parent";
  schoolId?: string;
};

type AuthContextType = {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  logout: () => void;
};

/* ====== Context ====== */
const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  logout: () => {},
});

/* ====== Provider ====== */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      try {
        // هل المستخدم مسجل دخول؟
        if (!pb.authStore.isValid) {
          setLoading(false);
          return;
        }

        // جلب المستخدم مع profile
        const authRecord = await pb
          .collection("users")
          .getOne(pb.authStore.model!.id, {
            expand: "profile",
          });

        setUser(authRecord);

        const prof = authRecord.expand?.profile;

        if (prof) {
          setProfile({
            id: prof.id,
            role: prof.role,
            schoolId: prof.schoolId,
          });
        }
      } catch (err) {
        console.error("Auth init error", err);
        pb.authStore.clear();
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  function logout() {
    pb.authStore.clear();
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ====== Hook ====== */
export function useAuth() {
  return useContext(AuthContext);
}
