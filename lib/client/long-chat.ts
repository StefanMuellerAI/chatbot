import type { ChatMessage, UsageInfo } from "@/lib/shared/types";

/** Höchstzahl Nachrichten pro Anfrage (wie im ChatRequestSchema des Servers). */
export const MAX_CHAT_MESSAGES = 500;
/** Vercel nimmt höchstens 4,5 MB pro Anfrage an (gemessen nach dem Komprimieren) – mit etwas Abstand. */
export const MAX_REQUEST_BYTES = 4.3 * 1024 * 1024;

// Ab hier rät Freebie zu einem neuen Chat – rechtzeitig vor den harten Grenzen (500 Nachrichten, 4,5 MB,
// Kontextfenster des Modells). Lange Verläufe machen jede Antwort außerdem langsamer und teurer.
const HINT_MESSAGES = 400;
const HINT_INPUT_TOKENS = 150_000;
const HINT_CHARS = 3 * 1024 * 1024;

/**
 * Hinweis über dem Eingabefeld, wenn der Verlauf (so, wie er an den Server geht) lang wird; sonst null.
 * Gezählt werden die Nachrichten, die Größe der Anfrage und der Eingabe-Umfang der letzten Antwort (`usage`).
 */
export function longChatHint(payload: ChatMessage[], usage?: UsageInfo): string | null {
  const tokens = usage ? usage.inputTokens + usage.cacheReadTokens + usage.cacheWriteTokens : 0;
  const count = payload.length;
  if (count < HINT_MESSAGES && tokens < HINT_INPUT_TOKENS && JSON.stringify(payload).length < HINT_CHARS) return null;
  if (count >= MAX_CHAT_MESSAGES) {
    return `Dieser Chat hat die Höchstzahl von ${MAX_CHAT_MESSAGES} Nachrichten erreicht. Bitte einen neuen Chat starten – dieser bleibt im Verlauf erhalten.`;
  }
  const counted = count >= HINT_MESSAGES ? ` (${count} von höchstens ${MAX_CHAT_MESSAGES} Nachrichten)` : "";
  return `Dieser Chat ist schon sehr lang${counted}. Für neue Fragen bitte einen neuen Chat starten – dort antwortet Freebie schneller, und dieser Chat bleibt im Verlauf erhalten.`;
}
