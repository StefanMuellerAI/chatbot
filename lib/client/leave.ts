"use client";
import { useEffect } from "react";

// Warnung beim Verlassen der Seite, solange eine Antwort oder ein Upload läuft – sonst gingen sie beim Neuladen,
// Schließen oder Zurückgehen verloren. Safari auf iPad und iPhone zeigt solche Warnungen allerdings nicht an.
let leaving = false;

/** Seite bewusst verlassen (Abmelden, Sitzung abgelaufen) – ohne die Warnung. */
export function leavePage(url: string) {
  leaving = true;
  window.location.replace(url);
}

/** Meldet sich beim Verlassen der Seite, solange `active` gilt. */
export function useLeaveWarning(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const warn = (e: BeforeUnloadEvent) => {
      if (leaving) return;
      e.preventDefault();
      // Ältere Browser verlangen zusätzlich returnValue.
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [active]);
}
