import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";

/* ---------------- TYPES ---------------- */
export type UserRole = "customer" | "seller" | "admin" | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
  avatar?: string | null;
  phone?: string;
  address?: string;
}

/* ---------------- NORMALIZER ---------------- */
export const normalizeUserFromPayload = (payload: any): User | null => {
  if (!payload) return null;

  const user = payload?.user ? payload.user : payload;
  const token = payload?.token || user?.token || "";

  return {
    id: user?._id || user?.id || "",
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || null,
    token,
    avatar: user?.avatar || user?.profilePicture || null,
    phone: user?.phone || "",
    address: user?.address || "",
  };
};

/* ---------------- CONTEXT ---------------- */
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<User>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ---------------- PROVIDER ---------------- */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  /* 🔥 Restore session */
  useEffect(() => {
    const stored = localStorage.getItem("banacrafts_user");
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      const token = parsed?.token || parsed?.user?.token || "";
      if (!token) throw new Error("No token available");

      fetch("http://localhost:5000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((data) => {
          const normalized = normalizeUserFromPayload({
            ...data,
            token,
          });

          if (normalized) {
            setUser(normalized);
            localStorage.setItem("banacrafts_user", JSON.stringify({
              user: {
                _id: normalized.id,
                name: normalized.name,
                email: normalized.email,
                role: normalized.role,
              },
              token: normalized.token,
            }));
          }
        })
        .catch(() => {
          localStorage.removeItem("banacrafts_user");
          setUser(null);
        });
    } catch {
      localStorage.removeItem("banacrafts_user");
      setUser(null);
    }
  }, []);

  /* ---------------- LOGIN ---------------- */
  const login = async (
    email: string,
    password: string
  ): Promise<User> => {
    const res = await axios.post("http://localhost:5000/api/auth/login", {
      email,
      password,
    });

    const data = res.data;
    const normalized = normalizeUserFromPayload(data);

    if (!normalized) throw new Error("Invalid user data");

    setUser(normalized);
    localStorage.setItem("banacrafts_user", JSON.stringify(data));

    return normalized;
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<User> => {
    const res = await axios.post("http://localhost:5000/api/auth/register", {
      name,
      email,
      password,
      role,
    });

    const data = res.data;
    const normalized = normalizeUserFromPayload(data);

    if (!normalized) throw new Error("Invalid user data");

    setUser(normalized);
    localStorage.setItem("banacrafts_user", JSON.stringify(data));

    return normalized;
  };

  /* ---------------- LOGOUT ---------------- */
  const logout = () => {
    setUser(null);
    localStorage.removeItem("banacrafts_user");
  };

  /* ---------------- UPDATE USER ---------------- */
  const updateUser = (data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;

      const updated = { ...prev, ...data };
      localStorage.setItem("banacrafts_user", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        setUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* ---------------- HOOK ---------------- */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};