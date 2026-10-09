import type { z } from "zod";

const nf = new Intl.NumberFormat("de-DE");

/**
 * Übersetzt den ersten zod-Fehler in eine deutsche Meldung mit Feldnamen,
 * z. B. „Antwort-Cache gültig (Stunden): höchstens 720“.
 */
export function germanZodMessage(err: z.ZodError, labels: Record<string, string> = {}): string {
  const issue = err.issues[0];
  if (!issue) return "Ungültige Eingabe.";
  const path = issue.path.map(String);
  const label = labels[path.join(".")] ?? labels[path[0] ?? ""] ?? (path.join(".") || "Eingabe");
  const i = issue as unknown as { code: string; origin?: string; minimum?: number; maximum?: number; expected?: string; format?: string; message: string };
  let text: string;
  switch (i.code) {
    case "too_small":
      text =
        i.origin === "string"
          ? i.minimum === 1
            ? "darf nicht leer sein"
            : `mindestens ${nf.format(i.minimum!)} Zeichen`
          : i.origin === "array"
            ? `mindestens ${nf.format(i.minimum!)} Einträge`
            : `mindestens ${nf.format(i.minimum!)}`;
      break;
    case "too_big":
      text =
        i.origin === "string"
          ? `höchstens ${nf.format(i.maximum!)} Zeichen`
          : i.origin === "array"
            ? `höchstens ${nf.format(i.maximum!)} Einträge`
            : `höchstens ${nf.format(i.maximum!)}`;
      break;
    case "invalid_type":
      text = i.expected === "int" ? "muss eine ganze Zahl sein" : i.expected === "number" ? "muss eine Zahl sein" : "fehlt oder hat das falsche Format";
      break;
    case "invalid_format":
      // Eigene Meldungen (z. B. für IDs) haben Vorrang.
      text = i.message && !i.message.startsWith("Invalid") ? i.message : "hat ein ungültiges Format";
      break;
    case "invalid_value":
      text = "hat einen ungültigen Wert";
      break;
    default:
      text = i.message && !/^(Invalid|Too|Expected)/.test(i.message) ? i.message : "ist ungültig";
  }
  return `${label}: ${text}`;
}
