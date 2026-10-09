import "server-only";
import { z } from "zod";
import { germanZodMessage } from "@/lib/validation";

// Gemeinsame Eingabeprüfung der Termin-Routen (deutsche Meldungen mit Feldnamen).

export const LABELS: Record<string, string> = {
  id: "ID",
  eventId: "Termin",
  groupId: "Gruppe",
  name: "Name",
  startsAt: "Beginn",
  endsAt: "Ende",
  count: "Anzahl der Gäste",
};

const date = z
  .string()
  .min(1)
  .max(40)
  .transform((s) => new Date(s));

export const EventInput = z.object({ name: z.string().trim().min(1).max(100), startsAt: date, endsAt: date });
export const IdInput = z.object({ id: z.string().min(1).max(100) });
export const GroupInput = z.object({ eventId: z.string().min(1).max(100), name: z.string().trim().min(1).max(60), count: z.number().int().min(0).max(200).default(0) });
export const GuestsInput = z.object({ groupId: z.string().min(1).max(100), count: z.number().int().min(1).max(200) });

export function zodResponse(err: z.ZodError): Response {
  return Response.json({ error: germanZodMessage(err, LABELS) }, { status: 400 });
}

export function idParam(request: Request): string {
  const id = new URL(request.url).searchParams.get("id");
  return IdInput.parse({ id }).id;
}
