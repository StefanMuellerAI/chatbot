import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { prepareMessages } from "@/lib/chat/prepare";
import { getDb, schema } from "@/lib/db/client";
import { createCategory, createPrompt, deleteOwnItem, setHidden, showAllHidden, updateOwnItem } from "@/lib/fundus/store";
import { fundusKeyFor, saveDocuments, saveThread } from "@/lib/fundus/upload";
import { findItem, getCatalog, getFundusCatalog, libraryAttachment, libraryText, readLibraryFile, readPreview } from "@/lib/library/catalog";
import { EMPTY_FILTER, EMPTY_PROMPT_FILTER, filterDocuments, filterPrompts } from "@/lib/library/search";
import type { ChatMessage } from "@/lib/shared/types";
import { deleteExpiredFiles, getFile, putFile } from "@/lib/storage";
import { docx, pdf } from "../e2e/support/generate-files";
import { seedModel } from "./helpers";

async function stage(name: string, data: Buffer): Promise<string> {
  const key = fundusKeyFor(name);
  await putFile(key, data, "application/octet-stream", "fundus", 1);
  return key;
}

const meta = (title: string) => ({ title, summary: `Kurzbeschreibung ${title}`, date: "2026-10-14", tags: [] as never[], keywords: ["Testwort"] });

async function ownPdf(title: string): Promise<string> {
  const data = pdf([`${title} Inhalt ${randomBytes(4).toString("hex")}`]);
  const { saved } = await saveDocuments([{ key: await stage("Bericht.pdf", data), name: "Bericht.pdf", meta: meta(title) }]);
  return saved[0];
}

describe("Fundus-Katalog: mitgeliefert und eigene Inhalte", () => {
  it("führt beide Quellen zusammen und kennzeichnet eigene Einträge", async () => {
    const id = await ownPdf("Eigener Bericht");
    const catalog = await getFundusCatalog();
    const builtIn = await getCatalog();
    expect(catalog.documents.length).toBe(builtIn.documents.length + catalog.own.filter((x) => catalog.documents.some((d) => d.id === x)).length);
    const doc = catalog.documents.find((d) => d.id === id)!;
    expect(doc).toMatchObject({ type: "pdf", orgId: "eigen", unitId: "", title: "Eigener Bericht", author: { name: "Kursleitung" } });
    expect(catalog.own).toContain(id);
    expect(catalog.orgs.at(-1)).toMatchObject({ id: "eigen", name: "Eigene Inhalte", level: "eigen" });
    expect(catalog.version).toMatch(new RegExp(`^${builtIn.version}-\\d+$`));
    // Filter: Verwaltung „Eigene Inhalte“, Typ PDF, Suche nach Stichwort.
    expect(filterDocuments(catalog, { ...EMPTY_FILTER, orgId: "eigen" }).map((d) => d.id)).toContain(id);
    expect(filterDocuments(catalog, { ...EMPTY_FILTER, types: ["pdf"] }).every((d) => d.type === "pdf")).toBe(true);
    expect(filterDocuments(catalog, { ...EMPTY_FILTER, query: "testwort eigener" }).map((d) => d.id)).toContain(id);
  });

  it("ändert die Version bei jeder Änderung und blendet aus", async () => {
    const before = await getFundusCatalog();
    await setHidden("fb-beschlussvorlage-kita-nordstadt", true);
    const after = await getFundusCatalog();
    expect(after.version).not.toBe(before.version);
    expect(after.documents.some((d) => d.id === "fb-beschlussvorlage-kita-nordstadt")).toBe(false);
    await expect(findItem("fb-beschlussvorlage-kita-nordstadt")).rejects.toThrow("Nicht im Fundus gefunden.");
    await expect(readPreview("fb-beschlussvorlage-kita-nordstadt")).rejects.toThrow("Nicht im Fundus gefunden.");
    expect(await findItem("fb-beschlussvorlage-kita-nordstadt", { includeHidden: true })).toMatchObject({ kind: "document" });
    // Schon angehängt: bleibt in bestehenden Chats nutzbar.
    expect(await libraryText("fb-beschlussvorlage-kita-nordstadt")).toContain("Kiebitzweg");
    // Ein ausgeblendeter Verlauf versteckt auch seine Mails.
    const thread = before.threads[0];
    await setHidden(thread.id, true);
    await expect(findItem(thread.mails[0].id)).rejects.toThrow("Nicht im Fundus gefunden.");
    await showAllHidden();
    expect((await getFundusCatalog()).documents.some((d) => d.id === "fb-beschlussvorlage-kita-nordstadt")).toBe(true);
  });

  it("zeigt inaktive eigene Einträge nicht, hält sie aber für bestehende Chats bereit", async () => {
    const id = await ownPdf("Bald inaktiv");
    await updateOwnItem(id, { ...meta("Bald inaktiv"), enabled: false });
    expect((await getFundusCatalog()).documents.some((d) => d.id === id)).toBe(false);
    await expect(libraryAttachment(id, { nativePdf: true })).rejects.toThrow("Nicht im Fundus gefunden.");
    expect(await libraryText(id)).toContain("Bald inaktiv Inhalt");
  });

  it("hängt eigene PDFs an: Schlüssel unter fundus/, nativ möglich, Download byte-gleich", async () => {
    const id = await ownPdf("Zum Anhängen");
    const { attachment } = await libraryAttachment(id, { nativePdf: true });
    expect(attachment).toMatchObject({ kind: "document", libraryId: id, mime: "application/pdf", native: true, name: "Bericht.pdf" });
    expect(attachment.storageKey).toMatch(/^fundus\//);
    const file = await readLibraryFile(id);
    expect((await getFile(attachment.storageKey))?.data.equals(file.data)).toBe(true);
    const preview = await readPreview(id);
    expect(preview).toMatchObject({ type: "text", format: "pdf" });
  });

  it("liefert den Text aus der Datenbank, wenn der Datei-Cache abgelaufen ist; gelöscht → nicht mehr verfügbar", async () => {
    const id = await ownPdf("Cache weg");
    const { attachment } = await libraryAttachment(id, { nativePdf: false });
    const db = await getDb();
    await db.delete(schema.fileCache).where(eq(schema.fileCache.sha256, attachment.sha256));
    const model = seedModel("claude-sonnet-5-5");
    const message: ChatMessage = { id: "m1", role: "user", text: "Fasse zusammen.", createdAt: 0, attachments: [{ ...attachment, native: undefined }] };
    const [prepared] = await prepareMessages([message], model, { nativePdf: false });
    expect(JSON.stringify(prepared)).toContain("Cache weg Inhalt");
    await deleteOwnItem(id);
    await db.delete(schema.fileCache).where(eq(schema.fileCache.sha256, attachment.sha256));
    const [gone] = await prepareMessages([message], model, { nativePdf: false });
    expect(JSON.stringify(gone)).toContain("ist nicht mehr verfügbar");
    expect(await getFile(attachment.storageKey)).toBeNull();
  });

  it("der Aufräumjob lässt gespeicherte Dateien stehen und räumt vorgemerkte weg", async () => {
    const id = await ownPdf("Bleibt");
    const kept = (await findItem(id)) as { row: { fileKey: string } };
    const abandoned = await stage("abgebrochen.docx", docx());
    const db = await getDb();
    // Frist des abgebrochenen Uploads abgelaufen (vorgemerkt war ein Tag).
    await db.update(schema.storedFiles).set({ expiresAt: new Date(Date.now() - 1000) }).where(eq(schema.storedFiles.key, abandoned));
    await deleteExpiredFiles();
    expect(await getFile(abandoned)).toBeNull();
    expect(await getFile(kept.row.fileKey)).not.toBeNull();
    const [row] = await db.select().from(schema.storedFiles).where(eq(schema.storedFiles.key, kept.row.fileKey));
    expect(row.expiresAt.getUTCFullYear()).toBe(9999);
  });

  it("eigene Verläufe: Mails einzeln anhängbar, Anhänge als Dokumente, Löschen nimmt alles mit", async () => {
    const run = randomBytes(3).toString("hex");
    const mail = Buffer.from(
      [`From: Jan Petersen <j@stadt.example>`, "To: a@stadt.example", "Subject: Testverlauf", "Date: Mon, 13 Oct 2026 08:40:00 +0200", `Message-ID: <${run}@stadt.example>`, "", "Hallo Welt", ""].join("\r\n"),
    );
    const { id } = await saveThread([{ key: await stage("1.eml", mail), name: "1.eml" }], { ...meta("Testverlauf"), date: "" });
    const catalog = await getFundusCatalog();
    const thread = catalog.threads.find((t) => t.id === id)!;
    expect(thread).toMatchObject({ orgId: "eigen", subject: "Testverlauf", participants: ["Jan Petersen", "a@stadt.example"] });
    const { attachment } = await libraryAttachment(thread.mails[0].id, { nativePdf: false });
    expect(attachment).toMatchObject({ mime: "message/rfc822", libraryId: thread.mails[0].id });
    expect(await readPreview(thread.mails[0].id)).toMatchObject({ type: "thread" });
    await expect(readLibraryFile(id)).rejects.toThrow("Ein Verlauf hat keine eigene Datei");
    const result = await deleteOwnItem(id);
    expect(result.files).toBe(1);
    await expect(findItem(thread.mails[0].id, { includeHidden: true })).rejects.toThrow("Nicht im Fundus gefunden.");
  });
});

describe("Fundus-Katalog: Prompts", () => {
  it("liefert aktive Prompts mit Platzhaltern; Kategorien ohne aktive Prompts fehlen", async () => {
    const empty = await createCategory(`Leer ${randomBytes(3).toString("hex")}`);
    const catalog = await getFundusCatalog();
    expect(catalog.categories.some((c) => c.id === empty)).toBe(false);
    const mail = catalog.prompts.find((p) => p.id === "prompt-mailverlauf")!;
    expect(mail.placeholders.map((p) => [p.key, p.label, p.type, p.default])).toEqual([
      ["zielgruppe", "Zielgruppe", "text", ""],
      ["anzahl punkte", "Anzahl Punkte", "text", "5"],
      ["schwerpunkt", "Was ist dir wichtig?", "area", ""],
    ]);
    expect(catalog.prompts.find((p) => p.id === "prompt-protokoll-aufgaben")?.placeholders).toEqual([]);
  });

  it("filtert nach Kategorie (oder) und Suche (groß/klein, ä/ae, Platzhalter)", async () => {
    const id = await createPrompt({ title: "Größenvergleich", categoryId: "kat-recherche", description: "", text: "Vergleiche {{Straßenname}}.", placeholders: {}, enabled: true });
    const catalog = await getFundusCatalog();
    const ids = (f: Partial<typeof EMPTY_PROMPT_FILTER>) => filterPrompts(catalog, { ...EMPTY_PROMPT_FILTER, ...f }).map((p) => p.id);
    expect(ids({ query: "GROESSENVERGLEICH" })).toEqual([id]);
    expect(ids({ query: "strassenname" })).toEqual([id]);
    expect(ids({ query: "einfache sprache" })).toEqual(expect.arrayContaining(["prompt-einfache-sprache", "prompt-verstaendlichkeit"]));
    const two = ids({ categories: ["kat-recherche", "kat-prompten-lernen"] });
    expect(two).toEqual(expect.arrayContaining([id, "prompt-fakten-quellen", "prompt-verbessern"]));
    expect(two.every((x) => catalog.prompts.find((p) => p.id === x)!.categoryId !== "kat-schreiben")).toBe(true);
    expect(ids({ query: "gibt es nirgends xyz" })).toEqual([]);
  });
});
