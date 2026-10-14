import { requireUser } from "@/lib/auth/session";
import { requireGroupChats } from "@/lib/guards";
import { groupChatError, NO_STORE } from "@/lib/groupchat/api";
import { actorFor, candidatesFor } from "@/lib/groupchat/store";

/** Wen man einladen kann: Gäste ihre Gruppe, die Kursleitung die Gruppen laufender Termine. */
export async function GET() {
  try {
    const session = await requireUser();
    await requireGroupChats();
    return Response.json(await candidatesFor(actorFor(session)), { headers: NO_STORE });
  } catch (err) {
    return groupChatError(err);
  }
}
