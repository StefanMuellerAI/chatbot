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

/**
 * Fehlertypen von Anthropic mit ihrem HTTP-Status. Mitten im Stream (nach HTTP 200) kommt ein Fehler als
 * SSE-Ereignis „error“ – das SDK wirft dann einen APIError ohne Status, nur mit Typ (z. B. Überlastung).
 */
const ANTHROPIC_ERROR_STATUS: Record<string, number> = {
  invalid_request_error: 400,
  authentication_error: 401,
  permission_error: 403,
  not_found_error: 404,
  request_too_large: 413,
  rate_limit_error: 429,
  api_error: 500,
  timeout_error: 504,
  overloaded_error: 529,
};

/** HTTP-Status eines SDK-Fehlers – bei Fehlern mitten im Stream aus dem Fehlertyp abgeleitet. */
function statusOf(err: unknown): number | undefined {
  const e = err as { status?: unknown; type?: unknown; error?: { error?: { type?: unknown } } } | null;
  if (typeof e?.status === "number") return e.status;
  const type = typeof e?.type === "string" ? e.type : e?.error?.error?.type;
  return typeof type === "string" ? ANTHROPIC_ERROR_STATUS[type] : undefined;
}

/** Übersetzt Fehler der Anbieter (SDK-Fehler mit Status oder eigene ProviderError) in verständliche Meldungen. */
export function providerErrorMessage(err: unknown): string {
  const e = err as { message?: string; userMessage?: string; error?: { message?: string; code?: string; error?: { message?: string } } };
  if (typeof e?.userMessage === "string") return e.userMessage;
  const status = statusOf(err);
  if (status === 401) return "Der API-Schlüssel wurde abgelehnt. Bitte im Admin-Bereich prüfen.";
  if (status === 429) return "Der Anbieter ist gerade überlastet oder das Kontingent ist erschöpft. Bitte gleich nochmal versuchen.";
  if (status === 529) return "Der Anbieter ist gerade überlastet. Bitte gleich nochmal versuchen.";
  if (status === 413) return "Die Anfrage ist zu groß. Bitte kürzere Dateien verwenden oder einen neuen Chat starten.";
  if (status === 404) return "Das Modell ist beim Anbieter nicht verfügbar. Bitte die API-Modell-ID prüfen.";
  if (status === 403) return "Der API-Schlüssel hat keinen Zugriff auf dieses Modell.";
  if (status === 400) {
    // Anthropic: { error: { error: { message } } }, OpenAI: { error: { message } }.
    const detail = e.error?.error?.message ?? e.error?.message ?? e.message ?? "";
    // Verlauf länger als das Kontextfenster (Anthropic: „prompt is too long“, OpenAI: context_length_exceeded).
    if (e.error?.code === "context_length_exceeded" || /prompt is too long|context window|context length/i.test(detail)) return CHAT_TOO_LONG;
    return `Die Anfrage wurde abgelehnt: ${detail.slice(0, 300)}`;
  }
  if (status && status >= 500) return "Der Anbieter hat gerade Probleme. Bitte gleich nochmal versuchen.";
  const name = (err as Error | null)?.name ?? "";
  if (name === "APIConnectionTimeoutError" || /timed? ?out/i.test(e?.message ?? "")) {
    return "Der Anbieter hat zu lange nicht geantwortet. Bitte „Neu generieren“ verwenden.";
  }
  if (name === "APIConnectionError" || /^(terminated|fetch failed|socket hang up|other side closed)$|ECONNRESET|ECONNREFUSED/i.test(e?.message ?? "")) {
    return "Die Verbindung zum Anbieter ist abgebrochen. Bitte „Neu generieren“ verwenden.";
  }
  return `${UNKNOWN_ERROR} ${(e?.message ?? "unbekannt").slice(0, 300)}`;
}

/** Fehler eines Anbieters oder SDKs (hat einen HTTP-Status, einen bekannten Fehlertyp oder eine eigene Nutzermeldung). */
export function isProviderError(err: unknown): boolean {
  const e = err as { userMessage?: unknown } | null;
  return Boolean(e) && (typeof e!.userMessage === "string" || statusOf(err) !== undefined);
}
