"use client";
import { KeyRound, Loader2, LogOut, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/client/api";
import { Button } from "@/components/ui/Button";
import { Card, Field, inputClass, Notice } from "./fields";

export function SecurityTab({ appPasswordSet, reload }: { appPasswordSet: boolean; reload: () => void }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "success" | "danger"; text: string } | null>(null);

  const run = async (action: string, body: Record<string, unknown>, success: string) => {
    setBusy(action);
    setMessage(null);
    try {
      await api("/api/admin/security", { method: "POST", json: { action, ...body }, admin: true });
      setMessage({ tone: "success", text: success });
      setPassword("");
      reload();
    } catch (err) {
      setMessage({ tone: "danger", text: err instanceof Error ? err.message : "Aktion fehlgeschlagen" });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      {message && <Notice tone={message.tone}>{message.text}</Notice>}
      <Card title="Passwort für Teilnehmende" description={appPasswordSet ? "Aktuell gilt ein im Admin-Bereich gesetztes Passwort." : "Aktuell gilt das Passwort aus der Umgebungsvariable APP_PASSWORD."}>
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Neues Passwort (z. B. pro Schulung)" className="min-w-64 flex-1">
            <input className={inputClass} type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="mind. 4 Zeichen" autoComplete="off" />
          </Field>
          <Button variant="primary" disabled={password.length < 4 || busy !== null} onClick={() => run("set-password", { password }, "Neues Passwort gesetzt. Alle Teilnehmenden müssen sich neu anmelden.")}>
            {busy === "set-password" ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} Passwort setzen
          </Button>
        </div>
        {appPasswordSet && (
          <Button className="mt-3" size="sm" variant="ghost" disabled={busy !== null} onClick={() => run("reset-password", {}, "Es gilt wieder APP_PASSWORD.")}>
            <RefreshCw className="h-4 w-4" /> Zurück zum Passwort aus der Umgebung
          </Button>
        )}
        <p className="mt-3 text-xs text-muted">Das Admin-Passwort wird über die Umgebungsvariable ADMIN_PASSWORD in Vercel gesetzt.</p>
      </Card>
      <Card title="Sitzungen" description="Meldet alle Teilnehmenden sofort ab (z. B. nach einer Schulung).">
        <Button variant="secondary" disabled={busy !== null} onClick={() => confirm("Alle Sitzungen abmelden?") && run("revoke-sessions", {}, "Alle Sitzungen wurden abgemeldet.")}>
          {busy === "revoke-sessions" ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />} Alle abmelden
        </Button>
      </Card>
      <Card title="Antwort-Cache leeren" description="Löscht alle gespeicherten Antworten. Danach werden identische Anfragen wieder neu beantwortet.">
        <Button variant="danger" disabled={busy !== null} onClick={() => confirm("Antwort-Cache wirklich leeren?") && run("clear-answer-cache", {}, "Der Antwort-Cache wurde geleert.")}>
          {busy === "clear-answer-cache" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Cache leeren
        </Button>
      </Card>
    </div>
  );
}
