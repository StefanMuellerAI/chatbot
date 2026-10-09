"use client";
import { ArrowRight, Loader2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Vor dem Laden getippte oder vom Browser automatisch ausgefüllte Passwörter übernehmen –
  // sonst bliebe der Button gesperrt, obwohl im Feld etwas steht.
  const adoptPrefilled = useCallback((el: HTMLInputElement | null) => {
    if (el?.value) setPassword(el.value);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Anmeldung fehlgeschlagen.");
      }
      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Anmeldung fehlgeschlagen.");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-6 space-y-3">
      <label className="flex items-center gap-3 rounded-full border border-white/15 bg-black/20 px-4 focus-within:border-[#9b7bff]">
        <Lock className="h-4 w-4 text-white/50" />
        <input
          ref={adoptPrefilled}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Passwort"
          autoFocus
          autoComplete="current-password"
          className="h-12 w-full bg-transparent text-white outline-none placeholder:text-white/40"
          aria-label="Passwort"
        />
      </label>
      {error && <p className="rounded-xl bg-[#e41c68]/15 px-3 py-2 text-sm text-[#ff8fb5]" role="alert">{error}</p>}
      <button
        type="submit"
        disabled={busy || !password}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-gradient font-semibold text-white shadow-lg shadow-[#e41c68]/20 transition hover:opacity-95 disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Los geht&apos;s <ArrowRight className="h-5 w-5" /></>}
      </button>
    </form>
  );
}
