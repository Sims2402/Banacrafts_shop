import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "customer" | "seller" | "admin" | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
  avatar?: string | null;  // ✅ profile photo
  phone?: string;          // ✅ phone number
  address?: string;        // ✅ address
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;  // ✅ so ProfileEdit can update navbar instantly
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {

  const [user, setUser] = useState<User | null>(null);

  /* 🔥 CHECK TOKEN ON REFRESH */
  useEffect(() => {
    const checkUser = async () => {

      const storedUser = localStorage.getItem("banacrafts_user");
      if (!storedUser) return;

      try {

        const parsedUser = JSON.parse(storedUser);

        const res = await fetch("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${parsedUser.token}`
          }
        });

        if (!res.ok) {
          localStorage.removeItem("banacrafts_user");
          setUser(null);
          return;
        }

        const data = await res.json();

        // ✅ avatar, phone, address now included when restoring session
        setUser({
          id:      data._id,
          name:    data.name,
          email:   data.email,
          role:    data.role,
          token:   parsedUser.token,
          avatar:  data.avatar  || null,
          phone:   data.phone   || "",
          address: data.address || "",
        });

      } catch (err) {
        localStorage.removeItem("banacrafts_user");
        setUser(null);
      }
    };

    checkUser();
  }, []);

  /* LOGIN */
  const login = async (
    email: string,
    password: string,
    role: UserRole
  ): Promise<boolean> => {

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      if (!res.ok) {
        const err = await res.json();
        const error: any = new Error(err.message || "Login failed");
        error.response = { status: res.status };
        throw error;
      }

      const data = await res.json();

      const loggedInUser: User = {
        id:      data._id,
        name:    data.name,
        email:   data.email,
        role:    data.role,
        token:   data.token,
        avatar:  data.avatar  || null,  // ✅
        phone:   data.phone   || "",    // ✅
        address: data.address || "",    // ✅
      };

      setUser(loggedInUser);
      localStorage.setItem("banacrafts_user", JSON.stringify(loggedInUser));

      return true;

    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  /* LOGOUT */
  const logout = () => {
    setUser(null);
    localStorage.removeItem("banacrafts_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        setUser,  // ✅ exposed so ProfileEdit.tsx can update name/avatar in real time
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