import { randomUUID } from "node:crypto";
import type { Attachment } from "@/lib/shared/types";

export function transcriptAttachment(sha256: string, key: string, name: string, text: string): Attachment {
  return {
    id: randomUUID(),
    kind: "transcript",
    name: name.replace(/\.[^.]+$/, "") + " (Transkript)",
    mime: "text/plain",
    size: text.length,
    sha256,
    storageKey: key,
    tokenEstimate: Math.ceil(text.length / 3.5),
    preview: text.slice(0, 600),
  };
}
