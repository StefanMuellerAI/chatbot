"use client";
import type { FundusCatalog, LibraryPreview } from "@/lib/library/types";
import type { Attachment } from "@/lib/shared/types";
import { api, ApiError } from "./api";

let current: FundusCatalog | null = null;
let inflight: Promise<FundusCatalog> | null = null;
const previews = new Map<string, Promise<LibraryPreview>>();

/**
 * Katalog laden – bei jedem Öffnen des Fundus mit `If-None-Match` nachfragen: 304 ist billig, 200 bringt den neuen
 * Stand (die Kursleitung kann den Fundus während des Kurses ändern). Bei Fehlern beim nächsten Aufruf neu versuchen.
 */
export function loadCatalog(): Promise<FundusCatalog> {
  inflight ??= api<FundusCatalog>("/api/library", { cache: "no-store", headers: current ? { "If-None-Match": `"fundus-${current.version}"` } : undefined })
    .then((catalog) => (current = catalog))
    .catch((err: unknown) => {
      if (err instanceof ApiError && err.status === 304 && current) return current;
      throw err;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** Vorschauen ändern sich nie (eigene Dateien werden nicht ersetzt, nur gelöscht) – einmal pro Sitzung laden. */
export function loadPreview(id: string): Promise<LibraryPreview> {
  if (!previews.has(id)) {
    previews.set(
      id,
      api<LibraryPreview>(`/api/library/${encodeURIComponent(id)}`).catch((err: unknown) => {
        previews.delete(id);
        throw err;
      }),
    );
  }
  return previews.get(id)!;
}

export function libraryFileUrl(id: string): string {
  return `/api/library/${encodeURIComponent(id)}/file`;
}

export function attachFromLibrary(id: string, signal?: AbortSignal): Promise<Attachment> {
  return api<Attachment>("/api/library/attach", { method: "POST", json: { id }, signal });
}
