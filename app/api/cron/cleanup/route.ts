import { lt } from "drizzle-orm";
import { safeEqual } from "@/lib/auth/password";
import { deleteExpiredAnswers } from "@/lib/chat/answer-cache";
import { getDb, schema } from "@/lib/db/client";
import { deleteExpiredFiles } from "@/lib/storage";

export const maxDuration = 300;

/** Täglicher Aufräumjob (Vercel Cron): abgelaufene Dateien und Cache-Einträge löschen. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization") ?? "";
  if (!secret || !safeEqual(auth, `Bearer ${secret}`)) {
    return Response.json({ error: "Nicht erlaubt." }, { status: 401 });
  }
  const deletedFiles = await deleteExpiredFiles();
  await deleteExpiredAnswers();
  const db = await getDb();
  const dayAgo = new Date(Date.now() - 86_400_000);
  await db.delete(schema.transcriptionJobs).where(lt(schema.transcriptionJobs.createdAt, dayAgo));
  await db.delete(schema.loginAttempts).where(lt(schema.loginAttempts.windowStart, dayAgo));
  return Response.json({ ok: true, deletedFiles });
}
