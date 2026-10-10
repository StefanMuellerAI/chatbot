import { z } from "zod";
import { errorResponse, HttpError, requireUser } from "@/lib/auth/session";
import { requireMailbox } from "@/lib/guards";
import { deleteMail, getMail, listMails, mailboxFor, markRead, maybePurgeMail, sendMail } from "@/lib/mail/store";
import { MAIL_LIMITS } from "@/lib/shared/mail";
import { germanZodMessage } from "@/lib/validation";

const NO_STORE = { "Cache-Control": "no-store" };
const LABELS = { to: "An", cc: "Cc", subject: "Betreff", body: "Text", inReplyTo: "Antwort auf", id: "ID", read: "Gelesen" };

const Id = z.string().min(1).max(100);
const Address = z.string().max(200);
const Send = z
  .object({
    to: z.array(Address).max(MAIL_LIMITS.recipients),
    cc: z.array(Address).max(MAIL_LIMITS.recipients).optional(),
    subject: z.string().max(MAIL_LIMITS.subject),
    body: z.string().max(MAIL_LIMITS.body),
    inReplyTo: Id.nullable().optional(),
  })
  .strict();
const Read = z.object({ id: Id, read: z.boolean() }).strict();

function zodResponse(err: unknown): Response {
  if (err instanceof z.ZodError) return Response.json({ error: germanZodMessage(err, LABELS) }, { status: 400 });
  return errorResponse(err);
}

/** Liste eines Ordners (`folder=inbox|sent`, Suche `q`) oder mit `id` eine einzelne Mail. */
export async function GET(request: Request) {
  try {
    const session = await requireUser();
    await requireMailbox();
    await maybePurgeMail();
    const box = mailboxFor(session);
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (id !== null) return Response.json({ mail: await getMail(box, Id.parse(id)) }, { headers: NO_STORE });
    const folder = url.searchParams.get("folder") ?? "inbox";
    if (folder !== "inbox" && folder !== "sent") throw new HttpError(400, "Unbekannter Ordner.");
    const list = await listMails(box, { folder, query: url.searchParams.get("q") ?? undefined });
    return Response.json(list, { headers: NO_STORE });
  } catch (err) {
    return zodResponse(err);
  }
}

/** Senden. */
export async function POST(request: Request) {
  try {
    const session = await requireUser();
    await requireMailbox({ write: true });
    const input = Send.parse(await request.json());
    const mail = await sendMail(mailboxFor(session), { ...input, cc: input.cc ?? [] });
    return Response.json({ mail });
  } catch (err) {
    return zodResponse(err);
  }
}

/** Als gelesen bzw. ungelesen markieren. */
export async function PUT(request: Request) {
  try {
    const session = await requireUser();
    await requireMailbox();
    const { id, read } = Read.parse(await request.json());
    await markRead(mailboxFor(session), id, read);
    return Response.json({ ok: true });
  } catch (err) {
    return zodResponse(err);
  }
}

/** Eigene Kopie löschen. */
export async function DELETE(request: Request) {
  try {
    const session = await requireUser();
    await requireMailbox();
    const id = Id.parse(new URL(request.url).searchParams.get("id") ?? "");
    await deleteMail(mailboxFor(session), id);
    return Response.json({ ok: true });
  } catch (err) {
    return zodResponse(err);
  }
}
