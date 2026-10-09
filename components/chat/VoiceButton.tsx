"use client";
import { Loader2, Mic, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/client/api";
import { DIRECT_UPLOAD_LIMIT } from "@/lib/files/limits";
import { cn } from "@/components/ui/cn";

const MAX_SECONDS = 10 * 60;

/** Spracheingabe: Aufnahme im Browser, Transkription auf dem Server, Text ins Eingabefeld. */
export function VoiceButton({ onText, disabled }: { onText: (text: string) => void; disabled?: boolean }) {
  const [state, setState] = useState<"idle" | "recording" | "transcribing">("idle");
  const [seconds, setSeconds] = useState(0);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const cleanupRef = useRef<() => void>(() => {});

  useEffect(() => () => cleanupRef.current(), []);

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"].find((t) => MediaRecorder.isTypeSupported(t));
      const recorder = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 32_000 });
      const chunks: Blob[] = [];
      const started = Date.now();
      recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);

      // Pegelanzeige
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      ctx.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      let raf = 0;
      const tick = () => {
        analyser.getByteFrequencyData(data);
        setLevel(data.reduce((a, b) => a + b, 0) / data.length / 128);
        raf = requestAnimationFrame(tick);
      };
      tick();
      const timer = setInterval(() => {
        const s = Math.round((Date.now() - started) / 1000);
        setSeconds(s);
        if (s >= MAX_SECONDS && recorder.state === "recording") recorder.stop();
      }, 250);
      cleanupRef.current = () => {
        clearInterval(timer);
        cancelAnimationFrame(raf);
        stream.getTracks().forEach((t) => t.stop());
        ctx.close().catch(() => {});
      };

      recorder.onstop = async () => {
        cleanupRef.current();
        const duration = (Date.now() - started) / 1000;
        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        if (blob.size < 1000) {
          setState("idle");
          setSeconds(0);
          setError("Die Aufnahme war zu kurz. Bitte etwas länger sprechen.");
          return;
        }
        setState("transcribing");
        try {
          if (blob.size > DIRECT_UPLOAD_LIMIT) throw new Error("Die Aufnahme ist zu lang. Bitte kürzer sprechen.");
          const form = new FormData();
          const ext = blob.type.includes("mp4") ? "m4a" : blob.type.includes("ogg") ? "ogg" : "webm";
          form.set("file", new File([blob], `diktat.${ext}`, { type: blob.type }));
          form.set("durationSec", String(Math.round(duration)));
          const res = await api<{ text: string }>("/api/transcribe/dictate", { method: "POST", body: form });
          if (res.text) onText(res.text);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Transkription fehlgeschlagen");
        } finally {
          setState("idle");
          setSeconds(0);
        }
      };
      recorderRef.current = recorder;
      recorder.start(1000);
      setState("recording");
    } catch {
      setError("Kein Zugriff auf das Mikrofon. Bitte im Browser erlauben.");
      setState("idle");
    }
  };

  const stop = () => recorderRef.current?.state === "recording" && recorderRef.current.stop();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={state === "recording" ? stop : start}
        disabled={state === "transcribing" || (disabled && state === "idle")}
        title={state === "recording" ? "Aufnahme beenden" : "Spracheingabe"}
        aria-label={state === "recording" ? "Aufnahme beenden" : state === "transcribing" ? "Transkribiere …" : "Spracheingabe"}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-sm transition-colors disabled:opacity-40",
          state === "recording" ? "bg-danger-soft text-danger" : "text-muted hover:bg-surface-2 hover:text-text",
        )}
      >
        {state === "transcribing" ? (
          <Loader2 className="h-4.5 w-4.5 animate-spin" />
        ) : state === "recording" ? (
          <Square className="h-3.5 w-3.5 fill-current" />
        ) : (
          <Mic className="h-4.5 w-4.5" />
        )}
        {state === "recording" && (
          <>
            <span className="inline-flex h-4 items-end gap-0.5" aria-hidden>
              {[0.6, 1, 0.8].map((f, i) => (
                <span key={i} className="w-1 rounded-full bg-danger" style={{ height: `${Math.max(20, Math.min(100, level * 100 * f))}%` }} />
              ))}
            </span>
            <span className="tabular-nums">
              {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
            </span>
          </>
        )}
        {state === "transcribing" && <span className="max-sm:hidden">Transkribiere …</span>}
      </button>
      {error && (
        <button
          type="button"
          className="absolute bottom-11 left-0 z-30 w-64 rounded-xl border border-danger/30 bg-danger-soft p-2 text-left text-xs text-danger"
          role="alert"
          title="Schließen"
          onClick={() => setError(null)}
        >
          {error}
        </button>
      )}
    </div>
  );
}
