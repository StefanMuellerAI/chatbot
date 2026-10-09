"use client";
import { Loader2, Save } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/client/api";
import type { FeatureFlags } from "@/lib/shared/types";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Card, Field, inputClass, Notice, textareaClass } from "./fields";

export interface AdminSettings {
  features: FeatureFlags;
  imageModel: string;
  imageDefaultQuality: "low" | "medium" | "high";
  imageDefaultSize: "1024x1024" | "1536x1024" | "1024x1536";
  transcriptionModel: string;
  dictationModel: string;
  titleModelId: string;
  claudeCacheTtl: "5m" | "1h";
  answerCacheHours: number;
  fileRetentionDays: number;
  nativePdf: boolean;
  noticeText: string;
  noticeShort: string;
  paused: boolean;
  pausedMessage: string;
  systemPromptAddendum: string;
}

const FEATURES: { key: keyof FeatureFlags; label: string; hint: string }[] = [
  { key: "webSearch", label: "Websuche", hint: "Modelle dürfen im Web recherchieren (wird pro Suche abgerechnet)" },
  { key: "uploads", label: "Datei-Upload", hint: "PDF, Word, Excel, PowerPoint, Text und Bilder" },
  { key: "transcription", label: "Audio-Transkription", hint: "MP3 & Co. hochladen und transkribieren (OpenAI)" },
  { key: "dictation", label: "Spracheingabe", hint: "Mikrofon-Button im Eingabefeld (OpenAI)" },
  { key: "imageGeneration", label: "Bildgenerierung", hint: "Bild-Modus und Bild-Tool für alle Modelle (OpenAI)" },
  { key: "artifacts", label: "Artefakte", hint: "Webseiten, Diagramme und Grafiken im Seitenpanel" },
  { key: "answerCache", label: "Antwort-Cache", hint: "Identische Anfragen werden aus dem Zwischenspeicher beantwortet" },
  { key: "showCacheBadge", label: "Cache-Hinweis anzeigen", hint: "Kennzeichnet Antworten aus dem Antwort-Cache" },
  { key: "showCost", label: "Kosten pro Antwort anzeigen", hint: "Zeigt Teilnehmenden die geschätzten Kosten" },
];

export function SettingsTab({ initial, modelOptions, reload }: { initial: AdminSettings; modelOptions: { id: string; name: string }[]; reload: () => void }) {
  const [s, setS] = useState<AdminSettings>(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const set = <K extends keyof AdminSettings>(k: K, v: AdminSettings[K]) => setS((x) => ({ ...x, [k]: v }));

  const save = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await api("/api/admin/settings", { method: "PUT", json: s, admin: true });
      setMessage({ tone: "success", text: "Gespeichert." });
      reload();
    } catch (err) {
      setMessage({ tone: "danger", text: err instanceof Error ? err.message : "Speichern fehlgeschlagen" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Not-Aus" description="Pausiert Freebie sofort für alle Teilnehmenden.">
        <Switch label="Freebie pausieren" checked={s.paused} onChange={(v) => set("paused", v)} />
        <Field label="Meldung während der Pause" className="mt-2">
          <input className={inputClass} value={s.pausedMessage} onChange={(e) => set("pausedMessage", e.target.value)} />
        </Field>
      </Card>

      <Card title="Funktionen">
        <div className="grid gap-x-8 md:grid-cols-2">
          {FEATURES.map((f) => (
            <Switch key={f.key} label={f.label} description={f.hint} checked={s.features[f.key]} onChange={(v) => set("features", { ...s.features, [f.key]: v })} />
          ))}
        </div>
      </Card>

      <Card title="Caching" description="Spart API-Budget. Die Wirkung siehst du in der Übersicht.">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Claude Prompt-Cache (TTL)" hint="5 Min. reicht bei laufender Nutzung; 1 h für Übungen mit langen Pausen (Schreiben kostet dann das Doppelte).">
            <select className={inputClass} value={s.claudeCacheTtl} onChange={(e) => set("claudeCacheTtl", e.target.value as "5m" | "1h")}>
              <option value="5m">5 Minuten (Standard)</option>
              <option value="1h">1 Stunde</option>
            </select>
          </Field>
          <Field label="Antwort-Cache gültig (Stunden)" hint="Identische Anfragen innerhalb dieser Zeit kosten nichts.">
            <input className={inputClass} type="number" min={1} value={s.answerCacheHours} onChange={(e) => set("answerCacheHours", Number(e.target.value) || 24)} />
          </Field>
          <Field label="Dateien aufbewahren (Tage)" hint="Danach löscht der tägliche Aufräumjob Uploads und Bilder.">
            <input className={inputClass} type="number" min={1} max={90} value={s.fileRetentionDays} onChange={(e) => set("fileRetentionDays", Number(e.target.value) || 7)} />
          </Field>
        </div>
      </Card>

      <Card title="Modelle für Zusatzfunktionen">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Bildmodell (OpenAI)" hint="z. B. gpt-image-2, gpt-image-2.5-flare">
            <input className={inputClass} value={s.imageModel} onChange={(e) => set("imageModel", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Bildqualität (Standard)">
              <select className={inputClass} value={s.imageDefaultQuality} onChange={(e) => set("imageDefaultQuality", e.target.value as AdminSettings["imageDefaultQuality"])}>
                <option value="low">Entwurf</option>
                <option value="medium">Standard</option>
                <option value="high">Hoch</option>
              </select>
            </Field>
            <Field label="Bildformat (Standard)">
              <select className={inputClass} value={s.imageDefaultSize} onChange={(e) => set("imageDefaultSize", e.target.value as AdminSettings["imageDefaultSize"])}>
                <option value="1024x1024">Quadratisch</option>
                <option value="1536x1024">Querformat</option>
                <option value="1024x1536">Hochformat</option>
              </select>
            </Field>
          </div>
          <Field label="Transkriptionsmodell (Audio-Dateien)" hint="z. B. gpt-transcribe, gpt-4o-transcribe, whisper-1">
            <input className={inputClass} value={s.transcriptionModel} onChange={(e) => set("transcriptionModel", e.target.value)} />
          </Field>
          <Field label="Transkriptionsmodell (Spracheingabe)">
            <input className={inputClass} value={s.dictationModel} onChange={(e) => set("dictationModel", e.target.value)} />
          </Field>
          <Field label="Modell für Chat-Titel" hint="Ein schnelles, günstiges Modell">
            <select className={inputClass} value={s.titleModelId} onChange={(e) => set("titleModelId", e.target.value)}>
              {modelOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="pt-6">
            <Switch label="PDFs nativ an das Modell schicken" description="Layout und Grafiken bleiben erhalten, kostet aber deutlich mehr Tokens." checked={s.nativePdf} onChange={(v) => set("nativePdf", v)} />
          </div>
        </div>
      </Card>

      <Card title="Hinweis „Spielumgebung“" description="Erscheint auf der Login-Seite, beim ersten Start und in der Fußzeile.">
        <Field label="Vollständiger Text">
          <textarea className={textareaClass} rows={5} value={s.noticeText} onChange={(e) => set("noticeText", e.target.value)} />
        </Field>
        <Field label="Kurzform (Fußzeile)" className="mt-3">
          <input className={inputClass} value={s.noticeShort} onChange={(e) => set("noticeShort", e.target.value)} />
        </Field>
      </Card>

      <Card title="Hinweise an das Modell" description="Wird an den System-Prompt angehängt, z. B. Kontext zur aktuellen Schulung. Änderungen starten den Prompt-Cache neu.">
        <textarea
          className={textareaClass}
          rows={5}
          value={s.systemPromptAddendum}
          placeholder="z. B. Heute ist die Schulung „KI im Vertrieb“ für die Firma Muster GmbH. Beispiele bitte aus dem Vertriebsalltag wählen."
          onChange={(e) => set("systemPromptAddendum", e.target.value)}
        />
      </Card>

      <div className="sticky bottom-4 flex items-center justify-end gap-3">
        {message && <Notice tone={message.tone}>{message.text}</Notice>}
        <Button variant="primary" size="lg" onClick={save} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Einstellungen speichern
        </Button>
      </div>
    </div>
  );
}
