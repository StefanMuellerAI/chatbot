import { readFileSync } from "node:fs";
import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { fixture } from "./generate-files";

/** Pfad einer generierten Testdatei (siehe generate-files.ts). */
export const file = (name: string): string => fixture(name);

const MIME: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
  ods: "application/vnd.oasis.opendocument.spreadsheet",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  csv: "text/csv",
  tsv: "text/tab-separated-values",
  txt: "text/plain",
  md: "text/markdown",
  json: "application/json",
  py: "text/x-python",
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  wav: "audio/wav",
  ogg: "audio/ogg",
  webm: "audio/webm",
  flac: "audio/flac",
  mp4: "video/mp4",
};

/**
 * Datei als Inhalt (nicht als Pfad) – Pfade mit Sonderzeichen kommen sonst nicht im Browser an.
 * Optional unter anderem Namen, z. B. um eine falsche Endung zu testen.
 */
export function payload(name: string, as?: string) {
  const target = as ?? name;
  const ext = target.split(".").pop()!.toLowerCase();
  return { name: target, mimeType: MIME[ext] ?? "application/octet-stream", buffer: readFileSync(file(name)) };
}

/** Wie payload(), aber mit eigener Prüfsumme – damit Datei- und Transkript-Cache nicht greifen (auch bei Wiederholungen). */
export function freshPayload(name: string, as?: string) {
  const p = payload(name, as);
  return { ...p, buffer: Buffer.concat([p.buffer, Buffer.from(Math.random().toString(36).slice(2))]) };
}

export const attachments = (page: Page) => page.getByRole("group", { name: "Anhänge" });
export const chip = (page: Page, name: string): Locator => attachments(page).getByRole("group", { name, exact: true });

export async function attach(page: Page, ...names: (string | ReturnType<typeof payload>)[]) {
  await page.getByLabel("Dateien zum Anhängen").setInputFiles(names.map((n) => (typeof n === "string" ? payload(n) : n)));
}

/** Wartet, bis ein Anhang fertig verarbeitet ist (kein Fortschritt mehr). */
export async function expectReady(page: Page, name: string, status: RegExp | string) {
  await expect(chip(page, name)).toContainText(status, { timeout: 60_000 });
}
