import { z } from "zod";
import {
  IMAGE_TOOL_DESCRIPTION,
  IMAGE_TOOL_NAME,
  IMAGE_TOOL_SCHEMA,
  type CustomTool,
  type ImageToolInput,
  type ToolExecutor,
} from "@/lib/providers/types";
import type { StreamEvent } from "@/lib/shared/types";

export const ImageToolInputSchema = z.object({
  prompt: z.string().min(1),
  size: z.enum(["1024x1024", "1536x1024", "1024x1536"]),
  quality: z.enum(["low", "medium", "high"]),
  reference_image_ids: z.array(z.string()),
});

/** Das Bild-Werkzeug: erzeugt ein Bild, zeigt es sofort an und meldet die Bild-ID zurück. */
export function imageTool(generate: ToolExecutor, emit: (event: StreamEvent) => void): CustomTool {
  return {
    name: IMAGE_TOOL_NAME,
    description: IMAGE_TOOL_DESCRIPTION,
    schema: IMAGE_TOOL_SCHEMA as unknown as Record<string, unknown>,
    status: "Erzeuge Bild …",
    input: ImageToolInputSchema,
    run: async (input) => {
      const result = await generate(input as ImageToolInput);
      if (!result.ok) return { content: result.error, isError: true };
      emit({ type: "image", image: result.image });
      return { content: `Bild erzeugt und angezeigt (Bild-ID: ${result.image.id}).` };
    },
  };
}
