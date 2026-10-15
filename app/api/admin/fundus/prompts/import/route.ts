import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { HttpError } from "@/lib/errors";
import { fundusError, LABELS, PromptSchema } from "@/lib/fundus/api";
import { importPrompts } from "@/lib/fundus/store";
import { FUNDUS_LIMITS } from "@/lib/shared/fundus";
import type { PlaceholderSettings } from "@/lib/shared/placeholders";
import { PROMPT_FILE } from "@/lib/shared/prompt-import";
import { germanZodMessage } from "@/lib/validation";

// Prompt-Bibliothek importieren (Plan: PROMPT-IMPORT-PLAN.md). Der Browser liest und prüft die Datei und schickt nur
// die umgewandelten Einträge; der Server prüft sie mit denselben Regeln noch einmal.

const Entry = PromptSchema.omit({ categoryId: true }).strict();

const Body = z
  .object({
    prompts: z.array(Entry).max(PROMPT_FILE.maxEntries),
    categoryId: z.string().min(1).max(100).nullable().default(null),
    newCategory: z.string().max(FUNDUS_LIMITS.categoryName * 2).nullable().default(null),
    inactive: z.boolean().default(false),
    confirmed: z.boolean().default(false),
  })
  .strict();

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const length = Number(request.headers.get("content-length") ?? 0);
    if (length > PROMPT_FILE.maxBytes) throw new HttpError(413, "Die Datei ist zu groß (höchstens 4 MB).");
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > PROMPT_FILE.maxBytes) throw new HttpError(413, "Die Datei ist zu groß (höchstens 4 MB).");
    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      throw new HttpError(400, "Ungültige Anfrage.");
    }
    const parsed = Body.safeParse(json);
    if (!parsed.success) {
      // Fehler in einem Eintrag mit dessen Nummer melden („Eintrag 3: Titel: höchstens 160 Zeichen“).
      const issue = parsed.error.issues[0];
      if (issue?.path[0] === "prompts" && typeof issue.path[1] === "number") {
        const inner = new z.ZodError([{ ...issue, path: issue.path.slice(2) }]);
        throw new HttpError(400, `Eintrag ${issue.path[1] + 1}: ${germanZodMessage(inner, LABELS)}`);
      }
      throw parsed.error;
    }
    const body = parsed.data;
    if (!body.confirmed) throw new HttpError(400, "Bitte bestätigen, dass die Prompts keine echten personenbezogenen oder vertraulichen Daten enthalten.");
    if (Boolean(body.categoryId) === Boolean(body.newCategory?.trim())) throw new HttpError(400, "Kategorie: bitte eine Kategorie wählen oder einen Namen angeben.");
    const result = await importPrompts(
      body.prompts.map((p) => ({ ...p, placeholders: p.placeholders as PlaceholderSettings })),
      { categoryId: body.categoryId, newCategory: body.newCategory },
      { inactive: body.inactive },
    );
    return Response.json({ ok: true, ...result });
  } catch (err) {
    return fundusError(err);
  }
}
