import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

/** Resolve "system" → actual "dark" | "light" using the OS preference. */
const resolveTheme = (preference) => {
  if (preference === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return preference; // "light" | "dark"
};

/** Apply / remove the .dark class on <html>. */
const applyClass = (resolved) => {
  if (resolved === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

export const ThemeProvider = ({ children }) => {
  // What the user explicitly chose: "light" | "dark" | "system"
  const [preference, setPreference] = useState(
    () => localStorage.getItem("theme") || "dark"
  );

  // The actual theme currently applied
  const [resolved, setResolved] = useState(() =>
    resolveTheme(localStorage.getItem("theme") || "dark")
  );

  // Apply the resolved class whenever it changes
  useEffect(() => {
    applyClass(resolved);
  }, [resolved]);

  // BUG FIX: Listen for OS dark/light changes when preference === "system"
  useEffect(() => {
    if (preference !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    const handler = (e) => {
      const next = e.matches ? "dark" : "light";
      setResolved(next);
      applyClass(next); // apply immediately to avoid flash
    };

    // Sync immediately when user switches to "system"
    setResolved(mq.matches ? "dark" : "light");

    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler); // cleanup
  }, [preference]);

  /** Public API: accepts "light" | "dark" | "system" */
  const setTheme = useCallback((newPreference) => {
    localStorage.setItem("theme", newPreference);
    setPreference(newPreference);
    setResolved(resolveTheme(newPreference));
  }, []);

  /** Legacy two-state toggle (used by ThemeToggle floating button) */
  const toggleTheme = useCallback(() => {
    setTheme(resolved === "dark" ? "light" : "dark");
  }, [resolved, setTheme]);

  return (
    <ThemeContext.Provider
      value={{ theme: resolved, preference, setTheme, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
