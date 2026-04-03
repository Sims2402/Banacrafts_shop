import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "customer" | "seller" | "admin" | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  avatar?: string;
}

/** Map API / stored JSON (with _id or profilePicture) to frontend User shape */
export function normalizeUserFromPayload(raw: unknown): User | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = String(r.id ?? r._id ?? "");
  if (!id) return null;
  const roleStr = String(r.role ?? "").toLowerCase();
  const role: UserRole =
    roleStr === "customer" || roleStr === "seller" || roleStr === "admin"
      ? roleStr
      : null;
  const pic =
    r.profilePicture ??
    r.profileImage ??
    r.avatar ??
    r.image ??
    r.photo;
  const avatarStr = pic != null ? String(pic).trim() : "";
  return {
    id,
    name: String(r.name ?? ""),
    email: String(r.email ?? ""),
    role,
    phone: r.phone != null ? String(r.phone) : undefined,
    address: r.address != null ? String(r.address) : undefined,
    avatar: avatarStr,
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("banacrafts_user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const normalized = normalizeUserFromPayload(parsed);
        if (normalized) {
          setUser(normalized);
          localStorage.setItem("banacrafts_user", JSON.stringify(normalized));
        } else {
          setUser(null);
          localStorage.removeItem("banacrafts_user");
        }
      } catch {
        setUser(null);
      }
    }
  }, []);

const login = async (email: string, password: string): Promise<boolean> => {
  const res = await fetch("http://localhost:5000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message);
  }

  const loggedInUser = normalizeUserFromPayload(data.user);
  if (!loggedInUser) {
    throw new Error("Invalid user payload from server");
  }

  setUser(loggedInUser);
  localStorage.setItem("banacrafts_user", JSON.stringify(loggedInUser));

  return true;
};

const register = async (
  name: string,
  email: string,
  password: string,
  role: UserRole
): Promise<boolean> => {

  let res: Response;
  try {
    res = await fetch("http://localhost:5000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role
      })
    });
  } catch {
    throw new Error("Cannot reach server. Is the backend running?");
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg =
      data && typeof data === "object"
        ? String((data as { message?: unknown; error?: unknown }).message || (data as { error?: unknown }).error || "Registration failed")
        : "Registration failed";
    throw new Error(msg);
  }

  const newUser = normalizeUserFromPayload(data.user);
  if (!newUser) {
    throw new Error("Invalid user payload from server");
  }

  setUser(newUser);
  localStorage.setItem("banacrafts_user", JSON.stringify(newUser));

  return true;
};

  const logout = () => {
    setUser(null);
    localStorage.removeItem("banacrafts_user");
  };
  const updateUser = (updatedData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;

      const merged = { ...prev, ...updatedData };
      const updatedUser = normalizeUserFromPayload(merged) ?? merged;

      localStorage.setItem("banacrafts_user", JSON.stringify(updatedUser));

      return updatedUser;
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
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
