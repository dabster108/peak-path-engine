import { createContext, useContext, useMemo, useState } from "react";

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

  const fromFullName = [user.first_name, user.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  if (fromFullName) return fromFullName;

  return (
    user.full_name ||
    user.name ||
    user.username ||
    (user.email ? user.email.split("@")[0] : "") ||
    ""
  );
}

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUserState] = useState(() => readStoredUser());

  const setUser = (nextUser) => {
    setUserState(nextUser || null);
    persistUser(nextUser || null);
    window.dispatchEvent(new Event("user-changed"));
  };

  const updateUser = (partial) => {
    setUserState((prev) => {
      const merged = { ...(prev || {}), ...partial };
      persistUser(merged);
      window.dispatchEvent(new Event("user-changed"));
      return merged;
    });
  };

  const clearUser = () => {
    setUserState(null);
    persistUser(null);
    window.dispatchEvent(new Event("user-changed"));
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      updateUser,
      clearUser,
      displayName: buildDisplayName(user),
    }),
    [user],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}
