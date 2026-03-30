// src\context\UserContext.jsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "../utils/api";
import { isAuthenticated } from "../App";

const USER_KEY = "shikhar_user";

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistUser(user) {
  if (!user) {
    localStorage.removeItem(USER_KEY);
    return;
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function buildDisplayName(user) {
  if (!user) return "";
  const fromName = [user.first_name, user.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  if (fromName) return fromName;
  return (
    user.full_name ||
    user.name ||
    user.username ||
    (user.email ? user.email.split("@")[0] : "") ||
    ""
  );
}

function hasAdminAccess(user) {
  if (!user) return false;
  return Boolean(user.is_superuser || user.is_staff || user.role === "admin");
}

const UserContext = createContext(null);

export function UserProvider({ children }) {
  // Start from localStorage cache so UI renders immediately
  const [user, setUserState] = useState(() => readStoredUser());

  const setUser = useCallback((nextUser) => {
    setUserState(nextUser || null);
    persistUser(nextUser || null);
    window.dispatchEvent(new Event("user-changed"));
  }, []);

  const updateUser = useCallback((partial) => {
    setUserState((prev) => {
      const merged = { ...(prev || {}), ...partial };
      persistUser(merged);
      window.dispatchEvent(new Event("user-changed"));
      return merged;
    });
  }, []);

  const clearUser = useCallback(() => {
    setUserState(null);
    persistUser(null);
    window.dispatchEvent(new Event("user-changed"));
  }, []);

  // ── Fetch fresh user from API on mount and on auth changes ──
  const fetchUser = useCallback(async () => {
    if (!isAuthenticated()) return;
    try {
      const [coreRes, extRes] = await Promise.all([
        api.get("profile/"),
        api.get("profile/extended/"),
      ]);
      setUser({ ...coreRes.data, ...extRes.data });
    } catch {
      // Keep cached user if API fails
    }
  }, [setUser]);

  useEffect(() => {
    fetchUser();
    const handler = () => fetchUser();
    window.addEventListener("auth-changed", handler);
    return () => window.removeEventListener("auth-changed", handler);
  }, [fetchUser]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      updateUser,
      clearUser,
      fetchUser,
      displayName: buildDisplayName(user),
      isAdmin: hasAdminAccess(user),
    }),
    [user, setUser, updateUser, clearUser, fetchUser],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
}
