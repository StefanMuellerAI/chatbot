import { z } from "zod";
import { MAX_ATTACHMENTS, MAX_MESSAGE_CHARS } from "@/lib/files/limits";

const Effort = z.enum(["low", "medium", "high", "max"]);

export const AttachmentSchema = z.object({
  id: z.string().max(100),
  kind: z.enum(["image", "document", "transcript"]),
  name: z.string().max(300),
  mime: z.string().max(200),
  size: z.number().nonnegative(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  storageKey: z.string().max(300),
  tokenEstimate: z.number().optional(),
  preview: z.string().max(2000).optional(),
  native: z.boolean().optional(),
});

export const ChatMessageSchema = z.object({
  id: z.string().max(100),
  role: z.enum(["user", "assistant"]),
  text: z.string().max(MAX_MESSAGE_CHARS),
  createdAt: z.number(),
  attachments: z.array(AttachmentSchema).max(MAX_ATTACHMENTS).optional(),
  contextDate: z.string().max(100).optional(),
  effort: Effort.optional(),
  webSearch: z.boolean().optional(),
  modelId: z.string().max(100).optional(),
  thinking: z.string().optional(),
  citations: z.array(z.object({ url: z.string(), title: z.string() })).optional(),
  images: z.array(z.object({ id: z.string(), url: z.string(), prompt: z.string() })).optional(),
  native: z
    .object({
      provider: z.enum(["anthropic", "openai", "mock"]),
      model: z.string(),
      items: z.array(z.unknown()),
    })
    .optional(),
  fromCache: z.boolean().optional(),
  usage: z.unknown().optional(),
  stopReason: z.string().optional(),
  error: z.string().optional(),
  fallbackModel: z.string().optional(),
});

export const ChatRequestSchema = z.object({
  conversationId: z.string().min(1).max(100),
  modelId: z.string().min(1).max(100),
  presetId: z.string().max(100).nullable(),
  messages: z.array(ChatMessageSchema).min(1).max(500),
  bypassCache: z.boolean().optional(),
});
