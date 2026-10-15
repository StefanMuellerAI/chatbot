import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { FileRef, fundusError } from "@/lib/fundus/api";
import { checkDocument, checkThread } from "@/lib/fundus/upload";
import { FUNDUS_LIMITS } from "@/lib/shared/fundus";

export const maxDuration = 120;

const Body = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("documents"), files: z.array(FileRef).min(1).max(FUNDUS_LIMITS.filesPerUpload) }),
  z.object({ kind: z.literal("thread"), files: z.array(FileRef).min(1).max(FUNDUS_LIMITS.mailsPerThread) }),
]);

/** Prüft hochgeladene Dateien vor dem Speichern: Typ, Text, Tokens, Vorschau, Hinweise und Dubletten. */
export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = Body.parse(await request.json());
    if (body.kind === "thread") return Response.json({ thread: await checkThread(body.files) });
    const documents = [];
    for (const f of body.files) {
      const { text: _text, ...checked } = await checkDocument(f.key, f.name);
      void _text;
      documents.push(checked);
    }
    return Response.json({ documents });
  } catch (err) {
    return fundusError(err);
  }
}
