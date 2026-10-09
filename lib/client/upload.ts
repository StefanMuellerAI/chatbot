"use client";
import { upload, uploadPresigned } from "@vercel/blob/client";
import { categoryOf, safeFileName, type UploadCategory } from "@/lib/files/limits";
import type { Attachment, PublicConfig } from "@/lib/shared/types";
import { api, ApiError } from "./api";

export type Progress = (fraction: number, label: string) => void;

const MAX_IMAGE_EDGE = 1568;

/** Verkleinert große Bilder vor dem Upload (spart Tokens und Zeit). */
export async function prepareImage(file: File): Promise<File> {
  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < 3 * 1024 * 1024) {
    bitmap.close();
    return file;
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const type = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, type, 0.9));
  if (!blob) return file;
  const name = type === "image/jpeg" ? file.name.replace(/\.(png|webp)$/i, ".jpg") : file.name;
  return new File([blob], name, { type });
}

export function uploadKeyFor(name: string): string {
  return `uploads/${crypto.randomUUID()}/${safeFileName(name)}`;
}

/** Lädt eine Datei hoch: auf Vercel direkt in Blob, lokal über den Server. */
export async function uploadFile(
  file: File,
  target: Pick<PublicConfig, "storage" | "blobUpload">,
  onProgress?: Progress,
  signal?: AbortSignal,
): Promise<string> {
  const key = uploadKeyFor(file.name);
  if (target.storage === "blob") {
    const put = target.blobUpload === "presigned" ? uploadPresigned : upload;
    await put(key, file, {
      access: "private",
      handleUploadUrl: "/api/upload/token",
      contentType: file.type || undefined,
      multipart: file.size > 8 * 1024 * 1024,
      abortSignal: signal,
      onUploadProgress: (e) => onProgress?.(e.percentage / 100, "Lade hoch …"),
    });
    return key;
  }
  const form = new FormData();
  form.set("key", key);
  form.set("file", file);
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload/local");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded / e.total, "Lade hoch …");
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else {
        let msg = `Upload fehlgeschlagen (${xhr.status})`;
        try {
          msg = (JSON.parse(xhr.responseText) as { error?: string }).error ?? msg;
        } catch {
          // ignorieren
        }
        reject(new ApiError(msg, xhr.status));
      }
    };
    xhr.onerror = () => reject(new ApiError("Upload fehlgeschlagen (Netzwerk).", 0));
    xhr.onabort = () => reject(new DOMException("Abgebrochen", "AbortError"));
    signal?.addEventListener("abort", () => xhr.abort(), { once: true });
    xhr.send(form);
  });
  return key;
}

export async function processUpload(key: string, name: string, signal?: AbortSignal): Promise<Attachment> {
  return api<Attachment>("/api/files/process", { method: "POST", json: { key, name }, signal });
}

/** Nur vorübergehende Fehler lohnen eine Wiederholung (Netz, Zeitlimit, Überlast, Serverfehler). */
function retryable(err: unknown): boolean {
  const status = err instanceof ApiError ? err.status : 0;
  return status === 0 || status === 408 || status === 429 || status >= 500;
}

/** Transkribiert eine hochgeladene Audiodatei in Etappen (Abschnitte parallel). */
export async function transcribeUpload(key: string, name: string, onProgress?: Progress, signal?: AbortSignal): Promise<Attachment> {
  onProgress?.(0, "Bereite Audio vor …");
  const start = await api<
    { done: true; attachment: Attachment; cached?: boolean } | { done: false; jobId: string; chunks: number; durationSec: number }
  >("/api/transcribe/start", { method: "POST", json: { key, name }, signal });
  if (start.done) {
    onProgress?.(1, "Aus dem Cache");
    return start.attachment;
  }
  let finished = 0;
  onProgress?.(0, `Transkribiere Abschnitt 0/${start.chunks} …`);
  const indexes = Array.from({ length: start.chunks }, (_, i) => i);
  const worker = async () => {
    while (indexes.length) {
      const index = indexes.shift()!;
      let attempt = 0;
      for (;;) {
        try {
          await api("/api/transcribe/chunk", { method: "POST", json: { jobId: start.jobId, index }, signal });
          break;
        } catch (err) {
          if (signal?.aborted || !retryable(err) || ++attempt >= 3) throw err;
          await new Promise((r) => setTimeout(r, 1500 * attempt));
        }
      }
      finished++;
      onProgress?.(finished / start.chunks, `Transkribiere Abschnitt ${finished}/${start.chunks} …`);
    }
  };
  await Promise.all(Array.from({ length: Math.min(3, start.chunks) }, worker));
  onProgress?.(1, "Füge zusammen …");
  const res = await api<{ attachment: Attachment }>("/api/transcribe/finish", {
    method: "POST",
    json: { jobId: start.jobId, name },
    signal,
  });
  return res.attachment;
}

export function uploadCategory(file: File): UploadCategory | null {
  return categoryOf(file.name);
}
