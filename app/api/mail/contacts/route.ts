import { errorResponse, requireUser } from "@/lib/auth/session";
import { requireMailbox } from "@/lib/guards";
import { contactsFor, mailboxFor } from "@/lib/mail/store";

/** Adressbuch: Gäste sehen ihre Gruppe und die Kursleitung, die Kursleitung alle Gruppen laufender Termine. */
export async function GET() {
  try {
    const session = await requireUser();
    await requireMailbox();
    return Response.json(await contactsFor(mailboxFor(session)), { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return errorResponse(err);
  }
}
