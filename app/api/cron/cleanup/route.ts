import { lt } from "drizzle-orm";
import { safeEqual } from "@/lib/auth/password";
import { deleteExpiredAnswers } from "@/lib/chat/answer-cache";
import { errorResponse } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db/client";
import { purgeExpiredGuests, purgeOldEvents } from "@/lib/events/store";
import { purgeMail } from "@/lib/mail/store";
import { getSettings } from "@/lib/settings";
import { deleteExpiredFiles } from "@/lib/storage";

export const maxDuration = 300;

/** Täglicher Aufräumjob (Vercel Cron): abgelaufene Dateien und Cache-Einträge löschen. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization") ?? "";
  if (!secret || !safeEqual(auth, `Bearer ${secret}`)) {
    return Response.json({ error: "Nicht erlaubt." }, { status: 401 });
  }
  try {
    const deletedFiles = await deleteExpiredFiles();
    await deleteExpiredAnswers();
    const db = await getDb();
    const dayAgo = new Date(Date.now() - 86_400_000);
    await db.delete(schema.transcriptionJobs).where(lt(schema.transcriptionJobs.createdAt, dayAgo));
    await db.delete(schema.loginAttempts).where(lt(schema.loginAttempts.windowStart, dayAgo));
    // Ausgelesene Texte und Transkripte nach derselben Frist wie die Dateien löschen
    // (bei jeder erneuten Nutzung wird ihr Zeitstempel aufgefrischt).
    const retention = new Date(Date.now() - (await getSettings({ fresh: true })).fileRetentionDays * 86_400_000);
    const texts = await db.delete(schema.fileCache).where(lt(schema.fileCache.createdAt, retention)).returning({ sha: schema.fileCache.sha256 });
    const transcripts = await db
      .delete(schema.transcriptCache)
      .where(lt(schema.transcriptCache.createdAt, retention))
      .returning({ sha: schema.transcriptCache.sha256 });
    // Zugänge beendeter Termine löschen; Termine selbst bleiben 90 Tage in der Statistik.
    const deletedGuests = await purgeExpiredGuests();
    const deletedEvents = await purgeOldEvents();
    // Posteingänge beendeter Termine (die meisten sind schon beim Abmelden weg).
    const deletedMails = await purgeMail();
    return Response.json({
      ok: true,
      deletedFiles,
      deletedTexts: texts.length,
      deletedTranscripts: transcripts.length,
      deletedGuests,
      deletedEvents,
      deletedMails,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
