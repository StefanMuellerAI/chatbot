// Fehlerklassen und -texte ohne Server-Abhängigkeiten (überall importierbar, auch ohne Zyklen).

/** Fehler mit HTTP-Status und einer Meldung, die Nutzerinnen und Nutzer sehen dürfen. */
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Der Verlauf passt nicht mehr in eine Anfrage (Kontextfenster des Modells, 500 Nachrichten oder 4,5 MB). */
export const CHAT_TOO_LONG = "Dieser Chat ist zu lang geworden. Bitte einen neuen Chat starten – dieser bleibt im Verlauf erhalten.";

/** Anfang der Meldung für Fehler, die keiner bekannten Ursache zugeordnet sind. */
export const UNKNOWN_ERROR = "Es ist ein Fehler aufgetreten:";

/** Übersetzt Fehler der Anbieter (SDK-Fehler mit Status oder eigene ProviderError) in verständliche Meldungen. */
export function providerErrorMessage(err: unknown): string {
  const e = err as { status?: number; message?: string; userMessage?: string; error?: { message?: string; code?: string; error?: { message?: string } } };
  if (typeof e?.userMessage === "string") return e.userMessage;
  if (e?.status === 401) return "Der API-Schlüssel wurde abgelehnt. Bitte im Admin-Bereich prüfen.";
  if (e?.status === 429) return "Der Anbieter ist gerade überlastet oder das Kontingent ist erschöpft. Bitte gleich nochmal versuchen.";
  if (e?.status === 413) return "Die Anfrage ist zu groß. Bitte kürzere Dateien verwenden oder einen neuen Chat starten.";
  if (e?.status === 404) return "Das Modell ist beim Anbieter nicht verfügbar. Bitte die API-Modell-ID prüfen.";
  if (e?.status === 403) return "Der API-Schlüssel hat keinen Zugriff auf dieses Modell.";
  if (e?.status === 400) {
    // Anthropic: { error: { error: { message } } }, OpenAI: { error: { message } }.
    const detail = e.error?.error?.message ?? e.error?.message ?? e.message ?? "";
    // Verlauf länger als das Kontextfenster (Anthropic: „prompt is too long“, OpenAI: context_length_exceeded).
    if (e.error?.code === "context_length_exceeded" || /prompt is too long|context window|context length/i.test(detail)) return CHAT_TOO_LONG;
    return `Die Anfrage wurde abgelehnt: ${detail.slice(0, 300)}`;
  }
  if (e?.status && e.status >= 500) return "Der Anbieter hat gerade Probleme. Bitte gleich nochmal versuchen.";
  const name = (err as Error | null)?.name ?? "";
  if (name === "APIConnectionTimeoutError" || /timed? ?out/i.test(e?.message ?? "")) {
    return "Der Anbieter hat zu lange nicht geantwortet. Bitte „Neu generieren“ verwenden.";
  }
  if (name === "APIConnectionError" || /^(terminated|fetch failed|socket hang up|other side closed)$|ECONNRESET|ECONNREFUSED/i.test(e?.message ?? "")) {
    return "Die Verbindung zum Anbieter ist abgebrochen. Bitte „Neu generieren“ verwenden.";
  }
  return `${UNKNOWN_ERROR} ${(e?.message ?? "unbekannt").slice(0, 300)}`;
}

/** Fehler eines Anbieters oder SDKs (hat einen HTTP-Status oder eine eigene Nutzermeldung). */
export function isProviderError(err: unknown): boolean {
  const e = err as { status?: unknown; userMessage?: unknown } | null;
  return Boolean(e) && (typeof e!.userMessage === "string" || typeof e!.status === "number");
}
