import { errorResponse, requireUser } from "@/lib/auth/session";
import { listModels, listPresets, providerConfigured, toPublicModel, toPublicPreset } from "@/lib/models";
import { getSettings } from "@/lib/settings";
import type { PublicConfig } from "@/lib/shared/types";
import { blobUploadMode, storageMode } from "@/lib/storage";

export async function GET() {
  try {
    await requireUser();
    const settings = await getSettings();
    const mock = process.env.FREEBIE_MOCK === "1";
    const models = (await listModels()).filter((m) => mock || providerConfigured(m.provider));
    const presets = await listPresets();
    const openaiReady = mock || providerConfigured("openai");
    const features = {
      ...settings.features,
      // Bilder, Transkription und Diktat laufen über OpenAI.
      imageGeneration: settings.features.imageGeneration && openaiReady,
      transcription: settings.features.transcription && openaiReady,
      dictation: settings.features.dictation && openaiReady,
    };
    const config: PublicConfig = {
      models: models.map(toPublicModel),
      presets: presets.map(toPublicPreset),
      features,
      notice: { full: settings.noticeText, short: settings.noticeShort },
      paused: settings.paused,
      pausedMessage: settings.pausedMessage,
      imageDefaults: { size: settings.imageDefaultSize, quality: settings.imageDefaultQuality },
      storage: storageMode(),
      blobUpload: blobUploadMode(),
    };
    return Response.json(config, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return errorResponse(err);
  }
}
