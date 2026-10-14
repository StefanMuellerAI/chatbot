/**
 * Steuerzeichen außer Tabulator und Zeilenumbruch (Nullbytes aus PDFs, Logdateien, kopiertem Text). Postgres lehnt
 * Nullbytes in Text und JSON ab, die Modelle brauchen keines davon.
 */
const CONTROL_CHARS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;

export function stripControlChars(text: string): string {
  return text.replace(CONTROL_CHARS, "");
}

/** Entfernt Nullbytes aus allen Texten eines JSON-Werts (z. B. vor dem Speichern als jsonb). */
export function withoutNullBytes<T>(value: T): T {
  if (typeof value === "string") return value.replaceAll("\u0000", "") as T;
  if (Array.isArray(value)) return value.map(withoutNullBytes) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [withoutNullBytes(k), withoutNullBytes(v)])) as T;
  }
  return value;
}
