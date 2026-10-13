import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { requireGroupChats } from "@/lib/guards";
import { groupChatError, NO_STORE } from "@/lib/groupchat/api";
import { actorFor, createChat, listChats, maybePurgeGroupChats } from "@/lib/groupchat/store";
import { GROUPCHAT_LIMITS } from "@/lib/shared/groupchat";

const Create = z
  .object({
    title: z.string().max(200),
    members: z.array(z.string().max(200)).max(GROUPCHAT_LIMITS.members * 2),
    groupId: z.string().max(100).nullable().optional(),
  })
  .strict();

/** Eigene Gruppenchats laufender Termine. */
export async function GET() {
  try {
    const session = await requireUser();
    await requireGroupChats();
    await maybePurgeGroupChats();
    return Response.json({ chats: await listChats(actorFor(session)) }, { headers: NO_STORE });
  } catch (err) {
    return groupChatError(err);
  }
}

/** Gruppenchat starten (Name und Personen; die Kursleitung wählt zusätzlich die Gruppe). */
export async function POST(request: Request) {
  try {
    const session = await requireUser();
    await requireGroupChats({ write: true });
    const input = Create.parse(await request.json());
    return Response.json({ chat: await createChat(actorFor(session), input) });
  } catch (err) {
    return groupChatError(err);
  }
}
