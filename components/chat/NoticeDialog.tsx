"use client";
import { ShieldAlert } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";

function hash(text: string): string {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
  return String(h);
}

/**
 * Hinweis „Spielumgebung“ beim ersten Start (und erneut, wenn sich der Text ändert) – pro Konto,
 * damit am gemeinsamen Schulungsrechner jeder Gast ihn selbst bestätigt.
 */
export function NoticeDialog({ text, accountKey, forceOpen, onClose }: { text: string; accountKey: string; forceOpen?: boolean; onClose?: () => void }) {
  const [dismissed, setDismissed] = useState(false);
  const key = `freebie-notice-${hash(text)}-${accountKey}`;
  const acknowledged = useSyncExternalStore(
    () => () => {},
    () => {
      try {
        return Boolean(localStorage.getItem(key));
      } catch {
        return false;
      }
    },
    () => true,
  );
  const open = !acknowledged && !dismissed;
  const close = () => {
    try {
      localStorage.setItem(key, "1");
    } catch {
      // ignorieren
    }
    setDismissed(true);
    onClose?.();
  };
  return (
    <Dialog open={open || Boolean(forceOpen)} onClose={close} dismissible={Boolean(forceOpen)} title={<span className="inline-flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-accent" /> Wichtiger Hinweis</span>}>
      <p className="leading-relaxed text-muted">{text}</p>
      <div className="mt-6 flex justify-end">
        <Button variant="brand" onClick={close}>
          Verstanden
        </Button>
      </div>
    </Dialog>
  );
}
