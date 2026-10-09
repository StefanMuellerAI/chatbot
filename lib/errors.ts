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

/** Übersetzt Fehler der Anbieter (SDK-Fehler mit Status oder eigene ProviderError) in verständliche Meldungen. */
export function providerErrorMessage(err: unknown): string {
  const e = err as { status?: number; message?: string; userMessage?: string; error?: { error?: { message?: string } } };
  if (typeof e?.userMessage === "string") return e.userMessage;
  if (e?.status === 401) return "Der API-Schlüssel wurde abgelehnt. Bitte im Admin-Bereich prüfen.";
  if (e?.status === 429) return "Der Anbieter ist gerade überlastet oder das Kontingent ist erschöpft. Bitte gleich nochmal versuchen.";
  if (e?.status === 413) return "Die Anfrage ist zu groß. Bitte kürzere Dateien verwenden oder einen neuen Chat starten.";
  if (e?.status === 404) return "Das Modell ist beim Anbieter nicht verfügbar. Bitte die API-Modell-ID prüfen.";
  if (e?.status === 403) return "Der API-Schlüssel hat keinen Zugriff auf dieses Modell.";
  if (e?.status === 400) {
    const detail = e.error?.error?.message ?? e.message ?? "";
    return `Die Anfrage wurde abgelehnt: ${detail.slice(0, 300)}`;
  }
  if (e?.status && e.status >= 500) return "Der Anbieter hat gerade Probleme. Bitte gleich nochmal versuchen.";
  return `Es ist ein Fehler aufgetreten: ${(e?.message ?? "unbekannt").slice(0, 300)}`;
}

/** Fehler eines Anbieters oder SDKs (hat einen HTTP-Status oder eine eigene Nutzermeldung). */
export function isProviderError(err: unknown): boolean {
  const e = err as { status?: unknown; userMessage?: unknown } | null;
  return Boolean(e) && (typeof e!.userMessage === "string" || typeof e!.status === "number");
}
