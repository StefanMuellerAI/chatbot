import "server-only";
import { z } from "zod";
import { errorResponse } from "@/lib/auth/session";
import { germanZodMessage } from "@/lib/validation";

export const NO_STORE = { "Cache-Control": "no-store" };

const LABELS: Record<string, string> = {
  title: "Name",
  members: "Personen",
  invite: "Personen",
  remove: "Person",
  groupId: "Gruppe",
  text: "Beitrag",
  attachments: "Anhänge",
  modelId: "Modell",
  effort: "Denktiefe",
  webSearch: "Websuche",
  regenerate: "Neu generieren",
  since: "Stand",
};

export const ChatId = z.string().min(1).max(100);

/** Fehler der Gruppenchat-Routen: deutsche Meldungen für Eingabefehler, sonst wie überall. */
export function groupChatError(err: unknown): Response {
  if (err instanceof z.ZodError) return Response.json({ error: germanZodMessage(err, LABELS) }, { status: 400 });
  return errorResponse(err);
}
