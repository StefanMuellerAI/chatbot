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

function handleUnauthorized(status: number, admin = false) {
  if (status === 401 && !admin && typeof window !== "undefined") {
    window.location.replace(`${window.location.origin}/login`);
  }
}

export async function api<T>(url: string, init?: RequestInit & { json?: unknown; admin?: boolean }): Promise<T> {
  const { json, admin, ...rest } = init ?? {};
  const res = await fetch(url, {
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
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
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
    const { value, done } = await reader.read();
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
