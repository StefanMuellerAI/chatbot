import type { usageTag } from "@/lib/auth/session";
import "server-only";
import { randomUUID } from "node:crypto";
import { toFile } from "openai";
import { getOpenAI } from "@/lib/providers/openai";
import type { ImageToolInput } from "@/lib/providers/types";
import { ProviderError } from "@/lib/providers/types";
import type { AppSettings } from "@/lib/settings";
import type { GeneratedImage } from "@/lib/shared/types";
import { getFile, putFile } from "@/lib/storage";
import { IMAGE_PRICES, logUsage } from "@/lib/usage";

export async function generateImage(
  input: ImageToolInput,
  ctx: { sessionHash: string; tag?: ReturnType<typeof usageTag>; settings: AppSettings },
): Promise<{ ok: true; image: GeneratedImage } | { ok: false; error: string }> {
  try {
    const id = randomUUID();
    const key = `images/${id}/bild.png`;
    let data: Buffer;
    let contentType = "image/png";
    let storedKey = key;

    if (process.env.FREEBIE_MOCK === "1") {
      data = Buffer.from(mockSvg(input.prompt));
      contentType = "image/svg+xml";
      storedKey = `images/${id}/bild.svg`;
    } else {
      const openai = getOpenAI();
      const refs = (input.reference_image_ids ?? []).filter((r) => /^(uploads|images)\//.test(r)).slice(0, 4);
      let b64: string | undefined;
      if (refs.length) {
        const files = [];
        for (const ref of refs) {
          const f = await getFile(ref);
          if (f) files.push(await toFile(f.data, ref.split("/").pop() ?? "bild.png", { type: f.contentType }));
        }
        if (files.length === 0) return { ok: false, error: "Das Referenzbild ist nicht mehr verfügbar." };
        const res = await openai.images.edit({
          model: ctx.settings.imageModel,
          image: files,
          prompt: input.prompt,
          size: input.size,
          quality: input.quality,
        });
        b64 = res.data?.[0]?.b64_json;
      } else {
        const res = await openai.images.generate({
          model: ctx.settings.imageModel,
          prompt: input.prompt,
          size: input.size,
          quality: input.quality,
          n: 1,
        });
        b64 = res.data?.[0]?.b64_json;
      }
      if (!b64) return { ok: false, error: "Die Bild-API hat kein Bild geliefert." };
      data = Buffer.from(b64, "base64");
    }

    await putFile(storedKey, data, contentType, "image", ctx.settings.fileRetentionDays);
    const cost = IMAGE_PRICES[input.quality]?.[input.size] ?? 0.05;
    await logUsage({
      sessionHash: ctx.sessionHash,
      ...ctx.tag,
      modelId: ctx.settings.imageModel,
      feature: "image",
      units: 1,
      costUsd: process.env.FREEBIE_MOCK === "1" ? 0 : cost,
    });
    return { ok: true, image: { id: storedKey, url: `/api/files/${storedKey}`, prompt: input.prompt } };
  } catch (err) {
    console.error("image generation failed", err);
    if (err instanceof ProviderError) return { ok: false, error: err.userMessage };
    const message = err instanceof Error ? err.message : "Unbekannter Fehler";
    return { ok: false, error: `Bildgenerierung fehlgeschlagen: ${message}` };
  }
}

function mockSvg(prompt: string): string {
  const safe = prompt.replace(/[<>&"]/g, "").slice(0, 60);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff6900"/><stop offset="1" stop-color="#e41c68"/></linearGradient></defs><rect width="1024" height="1024" fill="url(#g)"/><circle cx="512" cy="430" r="170" fill="none" stroke="#fff" stroke-width="28"/><text x="512" y="760" font-family="sans-serif" font-size="40" fill="#fff" text-anchor="middle">${safe}</text></svg>`;
}
