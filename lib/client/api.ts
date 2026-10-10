"use client";
import type { ChatRequestBody, StreamEvent } from "@/lib/shared/types";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export const NETWORK_ERROR = "Keine Verbindung zu Freebie. Bitte prüfe die Internetverbindung und versuche es erneut.";
export const STREAM_BROKEN = "Die Verbindung ist während der Antwort abgebrochen. Bitte „Neu generieren“ verwenden.";

/** fetch mit deutscher Meldung, wenn das Netz fehlt (statt „Failed to fetch“). */
async function request(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (err) {
    if (init.signal?.aborted) throw err;
    throw new ApiError(NETWORK_ERROR, 0);
  }
}

/** Ohne gültige Sitzung (oder als Gast im Admin-Bereich) zur Anmeldung. */
function handleUnauthorized(status: number, admin = false) {
  if (typeof window === "undefined") return;
  if (status === 401 || (admin && status === 403)) {
    window.location.replace(`${window.location.origin}/login${admin ? "?weiter=admin" : ""}`);
  }
}

export async function api<T>(url: string, init?: RequestInit & { json?: unknown; admin?: boolean }): Promise<T> {
  const { json, admin, ...rest } = init ?? {};
  const res = await request(url, {
    ...rest,
    headers: { ...(json !== undefined ? { "Content-Type": "application/json" } : {}), ...(rest.headers ?? {}) },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  if (!res.ok) {
    handleUnauthorized(res.status, admin);
    let message = `Fehler ${res.status}`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      // keine JSON-Antwort
    }
    throw new ApiError(message, res.status);
  }
  return (await res.json()) as T;
}

/** Startet eine Chat-Anfrage und ruft onEvent für jedes Server-Sent Event auf. */
export async function streamChat(
  body: ChatRequestBody,
  onEvent: (event: StreamEvent) => void,
  signal: AbortSignal,
): Promise<void> {
  const json = JSON.stringify(body);
  // Lange Verläufe komprimieren – Vercel nimmt höchstens 4,5 MB pro Anfrage an.
  const compress = json.length > 256 * 1024 && typeof CompressionStream !== "undefined";
  const payload = compress
    ? await new Response(new Blob([json]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer()
    : json;
  const res = await request("/api/chat", {
    method: "POST",
    headers: compress
      ? { "Content-Type": "application/octet-stream", "X-Freebie-Encoding": "gzip" }
      : { "Content-Type": "application/json" },
    body: payload,
    signal,
  });
  if (!res.ok || !res.body) {
    handleUnauthorized(res.status);
    let message = `Fehler ${res.status}`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      // ignorieren
    }
    throw new ApiError(message, res.status);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    let chunk: ReadableStreamReadResult<Uint8Array>;
    try {
      chunk = await reader.read();
    } catch (err) {
      if (signal.aborted) throw err;
      throw new ApiError(STREAM_BROKEN, 0);
    }
    const { value, done } = chunk;
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const raw = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      for (const line of raw.split("\n")) {
        if (line.startsWith("data: ")) {
          try {
            onEvent(JSON.parse(line.slice(6)) as StreamEvent);
          } catch {
            // unvollständiges Event ignorieren
          }
        }
      }
    }
  }
}
