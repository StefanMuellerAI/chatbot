"use client";
import { Loader2, LogOut, Trash2 } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/client/api";
import { Button } from "@/components/ui/Button";
import { Card, Notice } from "./fields";

export function SecurityTab({ adminUsername, reload }: { adminUsername: string; reload: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "success" | "danger"; text: string } | null>(null);

  const run = async (action: string, success: string) => {
    setBusy(action);
    setMessage(null);
    try {
      await api("/api/admin/security", { method: "POST", json: { action }, admin: true });
      setMessage({ tone: "success", text: success });
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
      <Card title="Zugänge" description="Gäste melden sich mit Zugangsdaten an, die du unter „Termine“ erzeugst. Sie gelten nur während ihres Termins.">
        <p className="text-sm text-muted">
          Admin-Zugang: Benutzername „{adminUsername}“, Passwort aus der Umgebungsvariable ADMIN_PASSWORD (in Vercel gesetzt).
        </p>
      </Card>
      <Card title="Sitzungen" description="Meldet alle Gäste und alle anderen Admin-Sitzungen sofort ab. Deine eigene Sitzung bleibt bestehen.">
        <Button variant="secondary" disabled={busy !== null} onClick={() => confirm("Alle Sitzungen abmelden?") && run("revoke-sessions", "Alle Sitzungen wurden abgemeldet.")}>
          {busy === "revoke-sessions" ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />} Alle abmelden
        </Button>
      </Card>
      <Card title="Antwort-Cache leeren" description="Löscht alle gespeicherten Antworten. Danach werden identische Anfragen wieder neu beantwortet.">
        <Button variant="danger" disabled={busy !== null} onClick={() => confirm("Antwort-Cache wirklich leeren?") && run("clear-answer-cache", "Der Antwort-Cache wurde geleert.")}>
          {busy === "clear-answer-cache" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Cache leeren
        </Button>
      </Card>
    </div>
  );
}
