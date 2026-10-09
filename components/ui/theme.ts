"use client";
import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark" | "system";

const EVENT = "freebie-theme-change";

function readTheme(): Theme {
  try {
    const stored = localStorage.getItem("freebie-theme");
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

function subscribe(callback: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  mq.addEventListener("change", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
    mq.removeEventListener("change", callback);
  };
}

function isDarkNow(): boolean {
  const theme = readTheme();
  return theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
}

/** Farbschema (hell/dunkel/System), gespeichert im Browser. */
export function useTheme(): [Theme, (t: Theme) => void, boolean] {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "system" as Theme);
  const isDark = useSyncExternalStore(subscribe, isDarkNow, () => false);
  const setTheme = useCallback((t: Theme) => {
    try {
      if (t === "system") localStorage.removeItem("freebie-theme");
      else localStorage.setItem("freebie-theme", t);
    } catch {
      // ignorieren
    }
    if (t === "system") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = t;
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return [theme, setTheme, isDark];
}
