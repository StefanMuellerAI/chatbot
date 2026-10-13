import { errorResponse, requireUser } from "@/lib/auth/session";
import { actorFor, listChats, maybePurgeGroupChats } from "@/lib/groupchat/store";
import { mailboxFor, mailStatus, maybePurgeMail } from "@/lib/mail/store";
import { getSettings } from "@/lib/settings";
import type { AppStatus } from "@/lib/shared/groupchat";

/**
 * Gemeinsame Statusabfrage des Chats (alle 15 Sekunden): Posteingang und Gruppenchats in einer Anfrage.
 * Ausgeschaltete Funktionen liefern null.
 */
export async function GET() {
  try {
    const session = await requireUser();
    const { features } = await getSettings();
    let mail: AppStatus["mail"] = null;
    if (features.mailbox) {
      await maybePurgeMail();
      mail = await mailStatus(mailboxFor(session));
    }
    let groupChats: AppStatus["groupChats"] = null;
    if (features.groupChats) {
      await maybePurgeGroupChats();
      groupChats = await listChats(actorFor(session));
    }
    return Response.json({ mail, groupChats } satisfies AppStatus, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return errorResponse(err);
  }
}
