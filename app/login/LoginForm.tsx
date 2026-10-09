"use client";
import { ArrowRight, Loader2, Lock, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { forgetExpiredGuest, forgetOtherGuests } from "@/lib/client/db";

export function LoginForm({ toAdmin = false, accessExpired = false }: { toAdmin?: boolean; accessExpired?: boolean }) {
  const router = useRouter();
  // Chats verfallener Gast-Zugänge nicht auf (oft gemeinsam genutzten) Schulungsrechnern liegen lassen.
  useEffect(() => {
    void (accessExpired ? forgetOtherGuests() : forgetExpiredGuest()).catch(() => {});
  }, [accessExpired]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Vor dem Laden getippte oder vom Browser automatisch ausgefüllte Werte übernehmen –
  // sonst bliebe der Button gesperrt, obwohl in den Feldern etwas steht.
  const adoptUsername = useCallback((el: HTMLInputElement | null) => {
    if (el?.value) setUsername(el.value);
  }, []);
  const adoptPassword = useCallback((el: HTMLInputElement | null) => {
    if (el?.value) setPassword(el.value);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; role?: "admin" | "guest"; key?: string };
      if (!res.ok) throw new Error(data.error ?? "Anmeldung fehlgeschlagen.");
      // Chats früherer Gäste auf diesem Gerät entfernen (Schulungsrechner).
      await forgetOtherGuests(data.key).catch(() => {});
      router.replace(toAdmin && data.role === "admin" ? "/admin" : "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Anmeldung fehlgeschlagen.");
      setBusy(false);
    }
  };

  const field = "flex items-center gap-3 rounded-full border border-white/15 bg-black/20 px-4 focus-within:border-[#9b7bff]";
  const input = "h-12 w-full bg-transparent text-white outline-none placeholder:text-white/40";
  return (
    <form onSubmit={submit} className="mt-6 space-y-3">
      <label className={field}>
        <User className="h-4 w-4 text-white/50" />
        <input
          ref={adoptUsername}
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Benutzername"
          autoFocus
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className={input}
          aria-label="Benutzername"
        />
      </label>
      <label className={field}>
        <Lock className="h-4 w-4 text-white/50" />
        <input
          ref={adoptPassword}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Passwort"
          autoComplete="current-password"
          className={input}
          aria-label="Passwort"
        />
      </label>
      {error && <p className="rounded-xl bg-[#e41c68]/15 px-3 py-2 text-sm text-[#ff8fb5]" role="alert">{error}</p>}
      <button
        type="submit"
        disabled={busy || !username.trim() || !password}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-gradient font-semibold text-white shadow-lg shadow-[#e41c68]/20 transition hover:opacity-95 disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Los geht&apos;s <ArrowRight className="h-5 w-5" /></>}
      </button>
    </form>
  );
}
