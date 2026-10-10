"use client";
import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "./cn";

export function Dialog({
  open,
  onClose,
  title,
  children,
  className,
  bodyClassName,
  dismissible = true,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Zusätzliche Klassen für den Innenbereich (z. B. weniger Rand auf dem Handy). */
  bodyClassName?: string;
  dismissible?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-labelledby={title ? titleId : undefined}
      onCancel={(e) => {
        e.preventDefault();
        if (dismissible) onClose();
      }}
      onClick={(e) => {
        if (dismissible && e.target === ref.current) onClose();
      }}
      className={cn(
        "m-auto w-[min(560px,calc(100vw-2rem))] rounded-3xl border border-border bg-surface p-0 text-text shadow-2xl",
        className,
      )}
    >
      {open && (
        <div className={cn("p-6", bodyClassName)}>
          {(title || dismissible) && (
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2 id={titleId} className="font-display text-xl font-bold">
                {title}
              </h2>
              {dismissible && (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-1.5 text-muted hover:bg-surface-2 hover:text-text"
                  aria-label="Schließen"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}
          {children}
        </div>
      )}
    </dialog>
  );
}
