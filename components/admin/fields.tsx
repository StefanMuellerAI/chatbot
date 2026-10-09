"use client";
import { cn } from "@/components/ui/cn";

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block text-sm", className)}>
      <span className="mb-1 block font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-primary disabled:opacity-60";
export const textareaClass = "w-full rounded-xl border border-border bg-surface p-3 text-sm leading-relaxed outline-none focus:border-primary";

export function Card({ title, description, children, actions }: { title?: string; description?: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="font-display text-lg font-bold">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warning" | "danger" | "success"; children: React.ReactNode }) {
  const styles = {
    info: "border-primary/25 bg-primary-soft text-primary",
    warning: "border-warning/30 bg-warning-soft text-warning",
    danger: "border-danger/30 bg-danger-soft text-danger",
    success: "border-success/30 bg-success-soft text-success",
  };
  return <div className={cn("rounded-2xl border px-4 py-3 text-sm", styles[tone])}>{children}</div>;
}
