"use client";
import type { LibraryCatalog, LibraryPreview } from "@/lib/library/types";
import type { Attachment } from "@/lib/shared/types";
import { api } from "./api";

let catalogPromise: Promise<LibraryCatalog> | null = null;
const previews = new Map<string, Promise<LibraryPreview>>();

/** Katalog einmal pro Sitzung laden; bei Fehlern beim nächsten Aufruf neu versuchen. */
export function loadCatalog(): Promise<LibraryCatalog> {
  catalogPromise ??= api<LibraryCatalog>("/api/library").catch((err: unknown) => {
    catalogPromise = null;
    throw err;
  });
  return catalogPromise;
}

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
