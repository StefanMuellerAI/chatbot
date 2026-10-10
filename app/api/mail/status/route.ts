import { errorResponse, requireUser } from "@/lib/auth/session";
import { requireMailbox } from "@/lib/guards";
import { mailboxFor, mailStatus, maybePurgeMail } from "@/lib/mail/store";

/** Ungelesene Mails und neueste Mail – der Chat fragt das alle 15 Sekunden ab. */
export async function GET() {
  try {
    const session = await requireUser();
    await requireMailbox();
    await maybePurgeMail();
    return Response.json(await mailStatus(mailboxFor(session)), { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return errorResponse(err);
  }
}
