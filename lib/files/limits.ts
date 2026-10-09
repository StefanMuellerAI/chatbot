// Gemeinsame Regeln für Uploads (Browser und Server).

export const AUDIO_EXTENSIONS = ["mp3", "m4a", "wav", "webm", "ogg", "oga", "mp4", "mpeg", "mpga", "aac", "flac"];
export const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "gif"];
export const DOCUMENT_EXTENSIONS = [
  "pdf", "docx", "xlsx", "xls", "xlsm", "ods", "csv", "tsv", "pptx",
  "txt", "md", "markdown", "json", "xml", "html", "htm", "css", "js", "ts", "tsx", "jsx", "py", "java",
  "c", "cpp", "cs", "go", "rb", "php", "sql", "yaml", "yml", "toml", "ini", "log", "sh", "rtf", "tex",
];

export const MAX_DOCUMENT_BYTES = 50 * 1024 * 1024;
export const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
// Vercel stellt 500 MB in /tmp bereit; Original + umgewandelte Abschnitte müssen hineinpassen.
export const MAX_AUDIO_BYTES = 300 * 1024 * 1024;
/** Unterhalb dieser Grenze geht ein Diktat direkt an den Server (Vercel-Limit 4,5 MB). */
/** Grenzen pro Chat-Nachricht (Browser und Server prüfen dieselben Werte). */
export const MAX_MESSAGE_CHARS = 400_000;
export const MAX_ATTACHMENTS = 20;

export const DIRECT_UPLOAD_LIMIT = 4 * 1024 * 1024;

export type UploadCategory = "image" | "audio" | "document";

export function categoryOf(name: string): UploadCategory | null {
  const ext = /\.([a-z0-9]+)$/i.exec(name)?.[1]?.toLowerCase() ?? "";
  if (IMAGE_EXTENSIONS.includes(ext)) return "image";
  if (AUDIO_EXTENSIONS.includes(ext)) return "audio";
  if (DOCUMENT_EXTENSIONS.includes(ext)) return "document";
  return null;
}

export function maxBytesFor(category: UploadCategory): number {
  return category === "audio" ? MAX_AUDIO_BYTES : category === "image" ? MAX_IMAGE_BYTES : MAX_DOCUMENT_BYTES;
}

export const ACCEPT_ATTRIBUTE = [...IMAGE_EXTENSIONS, ...AUDIO_EXTENSIONS, ...DOCUMENT_EXTENSIONS]
  .map((e) => `.${e}`)
  .join(",");

/** Gleiche Bereinigung wie auf dem Server (lib/storage.ts). */
export function safeFileName(name: string): string {
  const base = name.normalize("NFKD").replace(/[^\w.-]+/g, "_").replace(/_+/g, "_");
  return base.replace(/^[._]+/, "").slice(-100) || "datei";
}
