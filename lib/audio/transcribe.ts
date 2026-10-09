import "server-only";
import { toFile } from "openai";
import { getOpenAI } from "@/lib/providers/openai";

/** Transkribiert eine einzelne Audiodatei (< 25 MB) über die OpenAI-API. */
export async function transcribeBuffer(data: Buffer, fileName: string, mime: string, model: string): Promise<string> {
  if (process.env.FREEBIE_MOCK === "1") {
    return `[Testmodus] Transkript von ${fileName} (${Math.round(data.length / 1024)} KB).`;
  }
  const openai = getOpenAI();
  const file = await toFile(data, fileName, { type: mime });
  const res = await openai.audio.transcriptions.create({ file, model });
  const text = (res as { text?: string }).text ?? "";
  return text.trim();
}
