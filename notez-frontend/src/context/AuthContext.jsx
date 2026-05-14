import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on load
  useEffect(() => {
    const token = localStorage.getItem("notez_token");
    if (!token) { setLoading(false); return; }
    api.get("/auth/me")
      .then(r => setUser(r.data))
      .catch(() => localStorage.removeItem("notez_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("notez_token", data.token);
    setUser(data.user);
    toast.success(`Welcome back, ${data.user.name}! 🐙`);
    return data.user;
  };

  const register = async (name, email, password, college) => {
    const { data } = await api.post("/auth/register", { name, email, password, college });
    localStorage.setItem("notez_token", data.token);
    setUser(data.user);
    toast.success("Account created! Let's go 🚀");
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("notez_token");
    setUser(null);
    toast("Logged out 👋");
  };

  const refreshUser = async () => {
    const { data } = await api.get("/auth/me");
    setUser(data);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
