import { z } from "zod";
import { errorResponse, HttpError, requireUser, usageTag } from "@/lib/auth/session";
import { requireFeature } from "@/lib/guards";
import { generateImage } from "@/lib/tools/images";

export const maxDuration = 300;

const Body = z.object({
  prompt: z.string().min(1).max(4000),
  size: z.enum(["1024x1024", "1536x1024", "1024x1536"]),
  quality: z.enum(["low", "medium", "high"]),
  referenceIds: z.array(z.string().max(300)).max(4).default([]),
});

/** Bild-Modus: direkt ein Bild erzeugen, ohne Umweg über ein Chatmodell. */
export async function POST(request: Request) {
  try {
    const session = await requireUser();
    const settings = await requireFeature("imageGeneration");
    const body = Body.parse(await request.json());
    const result = await generateImage(
      { prompt: body.prompt, size: body.size, quality: body.quality, reference_image_ids: body.referenceIds },
      { sessionHash: session.sessionHash, tag: usageTag(session), settings },
    );
    if (!result.ok) throw new HttpError(502, result.error);
    return Response.json({ image: result.image });
  } catch (err) {
    if (err instanceof z.ZodError) return Response.json({ error: "Ungültige Anfrage." }, { status: 400 });
    return errorResponse(err);
  }
}
