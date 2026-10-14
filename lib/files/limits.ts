// Gemeinsame Regeln für Uploads (Browser und Server).

export const AUDIO_EXTENSIONS = ["mp3", "m4a", "wav", "webm", "ogg", "oga", "mp4", "mpeg", "mpga", "aac", "flac"];
export const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "gif"];
export const DOCUMENT_EXTENSIONS = [
  "pdf", "docx", "xlsx", "xls", "xlsm", "ods", "csv", "tsv", "pptx", "eml",
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

// Typische Verwechslungen aus dem Schulungsalltag: alte Office-Formate, Apple-Formate, Fotos vom iPad, Archive.
const TO_DOCX = "Bitte in Word als .docx speichern (Datei → Speichern unter).";
const TO_PPTX = "Bitte in PowerPoint als .pptx speichern (Datei → Speichern unter).";
const TO_IMAGE = "Bitte als PNG oder JPG speichern.";
const UNZIP = "Bitte zuerst entpacken und die Dateien einzeln anhängen.";
const FORMAT_TIPS: Record<string, string> = {
  doc: TO_DOCX,
  dot: TO_DOCX,
  ppt: TO_PPTX,
  pps: TO_PPTX,
  odt: "Bitte als .docx oder PDF speichern.",
  odp: "Bitte als .pptx oder PDF speichern.",
  pages: "Bitte in Pages als Word-Datei oder PDF exportieren (Ablage → Exportieren).",
  numbers: "Bitte in Numbers als Excel-Datei oder CSV exportieren (Ablage → Exportieren).",
  key: "Bitte in Keynote als PowerPoint oder PDF exportieren (Ablage → Exportieren).",
  heic: "Fotos vom iPhone oder iPad (HEIC) bitte als JPG speichern – oder über die Fotomediathek auswählen, dann wandelt das Gerät sie meist selbst um.",
  heif: "Fotos vom iPhone oder iPad (HEIF) bitte als JPG speichern – oder über die Fotomediathek auswählen, dann wandelt das Gerät sie meist selbst um.",
  tif: TO_IMAGE,
  tiff: TO_IMAGE,
  bmp: TO_IMAGE,
  svg: TO_IMAGE,
  msg: "Outlook-Nachrichten bitte in Outlook als .eml speichern – oder den Text kopieren und einfügen.",
  zip: UNZIP,
  rar: UNZIP,
  "7z": UNZIP,
  mov: "Videos bitte als .mp4 speichern – oder nur den Ton (z. B. .m4a) anhängen.",
  avi: "Videos bitte als .mp4 speichern – oder nur den Ton (z. B. .m4a) anhängen.",
  mkv: "Videos bitte als .mp4 speichern – oder nur den Ton (z. B. .m4a) anhängen.",
};

/** Meldung für Dateien, die Freebie nicht liest – mit Tipp, wie es doch geht (Browser und Server). */
export function unsupportedMessage(name: string): string {
  const ext = /\.([a-z0-9]+)$/i.exec(name)?.[1]?.toLowerCase();
  const tip = ext
    ? FORMAT_TIPS[ext]
    : "Die Datei hat keine Endung – bitte mit passender Endung speichern (z. B. .pdf, .docx, .txt). Ordner lassen sich nicht anhängen, nur die Dateien darin.";
  return tip ? `Dieses Format wird nicht unterstützt. ${tip}` : "Dieses Format wird nicht unterstützt.";
}

export function maxBytesFor(category: UploadCategory): number {
  return category === "audio" ? MAX_AUDIO_BYTES : category === "image" ? MAX_IMAGE_BYTES : MAX_DOCUMENT_BYTES;
}

export const ACCEPT_ATTRIBUTE = [...IMAGE_EXTENSIONS, ...AUDIO_EXTENSIONS, ...DOCUMENT_EXTENSIONS]
  .map((e) => `.${e}`)
  .join(",");

/** Dateiname für Speicherpfade (Browser und Server, lib/storage.ts nutzt dieselbe Funktion). */
export function safeFileName(name: string): string {
  const base = name.normalize("NFKD").replace(/[^\w.-]+/g, "_").replace(/_+/g, "_");
  const safe = base.replace(/^[._]+/, "").slice(-100) || "datei";
  // Namen ohne lateinische Buchstaben vor der Endung („Отчет.pdf“, „📊.csv“) verlören sonst die Endung – und
  // damit den Dateityp, den Upload und Verarbeitung aus dem Pfad lesen.
  const ext = /\.([a-z0-9]{1,10})$/i.exec(name)?.[1];
  return ext && !safe.toLowerCase().endsWith(`.${ext.toLowerCase()}`) ? `datei.${ext}` : safe;
}
