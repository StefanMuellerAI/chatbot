import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { MAX_ATTACHMENTS } from "@/lib/files/limits";
import { requireGroupChats } from "@/lib/guards";
import { ChatId, groupChatError } from "@/lib/groupchat/api";
import { actorFor, postMessage } from "@/lib/groupchat/store";
import { GROUPCHAT_LIMITS } from "@/lib/shared/groupchat";
import { AttachmentSchema } from "@/lib/shared/schemas";

const Post = z
  .object({
    text: z.string().max(GROUPCHAT_LIMITS.text),
    attachments: z.array(AttachmentSchema).max(MAX_ATTACHMENTS).optional(),
  })
  .strict();

/** Beitrag posten. Freebie antwortet erst, wenn der Browser danach /freebie aufruft (bei „@Freebie“). */
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireUser();
    await requireGroupChats({ write: true });
    const id = ChatId.parse((await ctx.params).id);
    const input = Post.parse(await request.json());
    return Response.json({ message: await postMessage(actorFor(session), id, input) });
  } catch (err) {
    return groupChatError(err);
  }
}
