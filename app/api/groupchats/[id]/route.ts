import { z } from "zod";
import { HttpError, requireUser } from "@/lib/auth/session";
import { requireGroupChats } from "@/lib/guards";
import { ChatId, groupChatError, NO_STORE } from "@/lib/groupchat/api";
import { actorFor, deleteChat, getChat, hideChat, leaveChat, maybePurgeGroupChats, updateChat } from "@/lib/groupchat/store";
import { GROUPCHAT_LIMITS } from "@/lib/shared/groupchat";

type Ctx = { params: Promise<{ id: string }> };

const Update = z.union([
  z.object({ title: z.string().max(200) }).strict(),
  z.object({ invite: z.array(z.string().max(200)).min(1).max(GROUPCHAT_LIMITS.members * 2) }).strict(),
  z.object({ remove: z.string().min(1).max(200) }).strict(),
]);

/** Ein Gruppenchat mit Mitgliedern und Beiträgen; mit `since` nur das seitdem Geänderte. */
export async function GET(request: Request, ctx: Ctx) {
  try {
    const session = await requireUser();
    await requireGroupChats();
    await maybePurgeGroupChats();
    const id = ChatId.parse((await ctx.params).id);
    const raw = new URL(request.url).searchParams.get("since") ?? "0";
    const since = Number(raw);
    if (!/^\d{1,10}$/.test(raw) || !Number.isSafeInteger(since)) throw new HttpError(400, "Ungültiger Stand.");
    return Response.json({ chat: await getChat(actorFor(session), id, since) }, { headers: NO_STORE });
  } catch (err) {
    return groupChatError(err);
  }
}

/** Umbenennen, einladen oder entfernen – nur die Person, die den Chat gestartet hat. */
export async function PUT(request: Request, ctx: Ctx) {
  try {
    const session = await requireUser();
    await requireGroupChats({ write: true });
    const id = ChatId.parse((await ctx.params).id);
    await updateChat(actorFor(session), id, Update.parse(await request.json()));
    return Response.json({ ok: true });
  } catch (err) {
    return groupChatError(err);
  }
}

/** Verlassen; `?forAll=1`: für alle löschen (startende Person); `?hide=1`: verlassenen Chat aus der Liste entfernen. */
export async function DELETE(request: Request, ctx: Ctx) {
  try {
    const session = await requireUser();
    await requireGroupChats();
    const id = ChatId.parse((await ctx.params).id);
    const params = new URL(request.url).searchParams;
    const actor = actorFor(session);
    if (params.get("forAll") === "1") await deleteChat(actor, id);
    else if (params.get("hide") === "1") await hideChat(actor, id);
    else await leaveChat(actor, id);
    return Response.json({ ok: true });
  } catch (err) {
    return groupChatError(err);
  }
}
