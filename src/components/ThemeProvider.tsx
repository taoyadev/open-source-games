"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useLayoutEffect,
} from "react";

type Theme = "dark" | "light" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_COOKIE = "theme";
const THEME_STORAGE_KEY = "opengames-theme";

// Get theme from cookie (works on server)
function getThemeFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(^| )${THEME_COOKIE}=([^;]+)`),
  );
  return match ? match[2] : null;
}

// Set theme cookie
function setThemeCookie(theme: string) {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 365; // 1 year
  document.cookie = `${THEME_COOKIE}=${theme};path=/;max-age=${maxAge};SameSite=Lax`;
}

// Get system preference
function getSystemTheme(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

// Apply theme to document
function applyTheme(isDark: boolean) {
  const root = document.documentElement;
  if (isDark) {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.remove("dark");
    root.classList.add("light");
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [isDark, setIsDark] = useState(false);

  // Initialize theme from cookie or localStorage
  // Using useLayoutEffect to apply theme before browser paint
  useLayoutEffect(() => {
    const savedTheme =
      getThemeFromCookie() || localStorage.getItem(THEME_STORAGE_KEY);
    const initialTheme = (savedTheme as Theme) || "system";

    const isDarkMode =
      initialTheme === "dark" ||
      (initialTheme === "system" && getSystemTheme());

    setIsDark(isDarkMode);
    applyTheme(isDarkMode);
    setThemeState(initialTheme);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const isDarkMode = mediaQuery.matches;
      setIsDark(isDarkMode);
      applyTheme(isDarkMode);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    setThemeCookie(newTheme);

    const isDarkMode =
      newTheme === "dark" || (newTheme === "system" && getSystemTheme());

    setIsDark(isDarkMode);
    applyTheme(isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

// Prevent flash of wrong theme during SSR
export function useThemeReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return ready;
}
