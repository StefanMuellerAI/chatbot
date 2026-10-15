import "server-only";
import { z } from "zod";
import { errorResponse } from "@/lib/auth/session";
import { HttpError } from "@/lib/errors";
import { FUNDUS_LIMITS, OWN_TAGS } from "@/lib/shared/fundus";
import { PLACEHOLDER_TYPES, PROMPT_LIMITS } from "@/lib/shared/placeholders";
import { germanZodMessage } from "@/lib/validation";

// Gemeinsame Prüfungen der Admin-Routen unter /api/admin/fundus.

export const LABELS: Record<string, string> = {
  id: "ID",
  key: "Datei",
  name: "Name",
  files: "Dateien",
  title: "Titel",
  summary: "Kurzbeschreibung",
  date: "Datum",
  tags: "Merkmale",
  keywords: "Stichwörter",
  enabled: "Aktiv",
  confirmed: "Bestätigung",
  categoryId: "Kategorie",
  description: "Kurzbeschreibung",
  text: "Prompt-Text",
  placeholders: "Platzhalter",
  move: "Reihenfolge",
  hidden: "Ausgeblendet",
};

const day = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "bitte als Datum (JJJJ-MM-TT)")
  .refine((d) => !Number.isNaN(Date.parse(`${d}T00:00:00Z`)) && new Date(`${d}T00:00:00Z`).toISOString().startsWith(d), "ist kein gültiges Datum");

export const MetaSchema = z.object({
  title: z.string().trim().min(1).max(FUNDUS_LIMITS.title),
  summary: z.string().trim().max(FUNDUS_LIMITS.summary).default(""),
  date: day,
  tags: z.array(z.enum(OWN_TAGS as [string, ...string[]])).max(OWN_TAGS.length).default([]),
  keywords: z.array(z.string().trim().min(1).max(FUNDUS_LIMITS.keyword)).max(FUNDUS_LIMITS.keywords).default([]),
});

export const FileRef = z.object({ key: z.string().min(1).max(300), name: z.string().trim().min(1).max(200) });

export const CONFIRM_MESSAGE = "Bitte bestätigen, dass die Dateien keine echten personenbezogenen oder vertraulichen Daten enthalten.";

export function requireConfirmed(confirmed: unknown): void {
  if (confirmed !== true) throw new HttpError(400, CONFIRM_MESSAGE);
}

export const PlaceholderSettingSchema = z
  .object({
    label: z.string().max(PROMPT_LIMITS.label * 2).optional(),
    hint: z.string().max(PROMPT_LIMITS.hint * 2).optional(),
    type: z.enum(PLACEHOLDER_TYPES as [string, ...string[]]).optional(),
    options: z.array(z.string().max(PROMPT_LIMITS.option * 2)).max(PROMPT_LIMITS.options * 2).optional(),
    default: z.string().max(PROMPT_LIMITS.single * 2).optional(),
  })
  .strict();

export const PromptSchema = z.object({
  title: z.string().max(FUNDUS_LIMITS.promptTitle * 2),
  categoryId: z.string().min(1).max(100),
  description: z.string().max(FUNDUS_LIMITS.promptDescription * 2).default(""),
  text: z.string().max(PROMPT_LIMITS.text * 2),
  placeholders: z.record(z.string().max(200), PlaceholderSettingSchema).default({}),
  enabled: z.boolean().default(true),
});

export const MoveSchema = z.union([z.literal(-1), z.literal(1)]);

/** Antwort für Fehler: zod-Fehler mit deutschem Feldnamen, sonst wie überall. */
export function fundusError(err: unknown): Response {
  if (err instanceof z.ZodError) return Response.json({ error: germanZodMessage(err, LABELS) }, { status: 400 });
  return errorResponse(err);
}

export function idParam(request: Request): string {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) throw new HttpError(400, "ID fehlt.");
  return id;
}
