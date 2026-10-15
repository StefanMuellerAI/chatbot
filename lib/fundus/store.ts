import "server-only";
import { randomBytes } from "node:crypto";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { HttpError } from "@/lib/errors";
import { fold } from "@/lib/library/search";
import { LIBRARY_ID, type LibraryTag } from "@/lib/library/types";
import { FUNDUS_LIMITS } from "@/lib/shared/fundus";
import { type PlaceholderSettings, validatePrompt } from "@/lib/shared/placeholders";
import { deleteFiles } from "@/lib/storage";

// Eigene Inhalte, ausgeblendete mitgelieferte Einträge, Kategorien und Prompts (Plan: FUNDUS-PFLEGE-PLAN.md).

export type OwnItemRow = typeof schema.fundusItems.$inferSelect;
export type OwnMailRow = typeof schema.fundusMails.$inferSelect;
export type CategoryRow = typeof schema.promptCategories.$inferSelect;
export type PromptRow = typeof schema.prompts.$inferSelect;

const nf = new Intl.NumberFormat("de-DE");

function rows<T>(res: unknown): T[] {
  return (Array.isArray(res) ? res : (res as { rows: T[] }).rows) as T[];
}

/** Lesbarer Teil einer ID aus einem Titel: klein, ä = ae, nur a–z, 0–9 und Bindestrich. */
export function slug(title: string): string {
  const s = fold(title)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
  return s || "eintrag";
}

/** Neue ID wie „eigen-leitfaden-ki-3f9a“ (passt zu LIBRARY_ID, kollidiert nie mit mitgelieferten IDs). */
export function newId(prefix: string, title: string): string {
  const id = `${prefix}-${slug(title)}-${randomBytes(2).toString("hex")}`;
  if (!LIBRARY_ID.test(id)) throw new Error(`Ungültige ID ${id}`);
  return id;
}

// ---------------------------------------------------------------- Revision (Katalog-Version, ETag)

/** Stand des Fundus: steigt mit jeder Änderung im Admin. */
export async function fundusRevision(): Promise<number> {
  const db = await getDb();
  const res = await db.execute(sql`SELECT value FROM settings WHERE key = 'fundus'`);
  const value = rows<{ value: { revision?: number } | string }>(res)[0]?.value;
  const parsed = typeof value === "string" ? (JSON.parse(value) as { revision?: number }) : value;
  return Number(parsed?.revision ?? 0);
}

export async function bumpRevision(): Promise<void> {
  const db = await getDb();
  await db.execute(sql`
    INSERT INTO settings (key, value, updated_at) VALUES ('fundus', '{"revision": 1}'::jsonb, now())
    ON CONFLICT (key) DO UPDATE SET
      value = jsonb_build_object('revision', coalesce((settings.value ->> 'revision')::int, 0) + 1),
      updated_at = now()`);
}

// ---------------------------------------------------------------- Ausgeblendete mitgelieferte Einträge

export async function listHidden(): Promise<string[]> {
  const db = await getDb();
  return (await db.select({ id: schema.fundusHidden.id }).from(schema.fundusHidden)).map((r) => r.id);
}

export async function setHidden(id: string, hidden: boolean): Promise<void> {
  const db = await getDb();
  if (hidden) await db.insert(schema.fundusHidden).values({ id }).onConflictDoNothing();
  else await db.delete(schema.fundusHidden).where(eq(schema.fundusHidden.id, id));
  await bumpRevision();
}

export async function showAllHidden(): Promise<number> {
  const db = await getDb();
  const deleted = await db.delete(schema.fundusHidden).returning({ id: schema.fundusHidden.id });
  if (deleted.length) await bumpRevision();
  return deleted.length;
}

// ---------------------------------------------------------------- Kategorien

export interface CategoryInfo {
  id: string;
  name: string;
  sortOrder: number;
  prompts: number;
  activePrompts: number;
}

export async function listCategories(): Promise<CategoryInfo[]> {
  const db = await getDb();
  const cats = await db.select().from(schema.promptCategories).orderBy(asc(schema.promptCategories.sortOrder), asc(schema.promptCategories.name));
  const prompts = await db.select({ categoryId: schema.prompts.categoryId, enabled: schema.prompts.enabled }).from(schema.prompts);
  return cats.map((c) => ({
    id: c.id,
    name: c.name,
    sortOrder: c.sortOrder,
    prompts: prompts.filter((p) => p.categoryId === c.id).length,
    activePrompts: prompts.filter((p) => p.categoryId === c.id && p.enabled).length,
  }));
}

function checkCategoryName(name: string, existing: CategoryRow[], exceptId?: string): string {
  const n = name.replace(/\s+/g, " ").trim();
  if (!n) throw new HttpError(400, "Name: darf nicht leer sein");
  if (n.length > FUNDUS_LIMITS.categoryName) throw new HttpError(400, `Name: höchstens ${FUNDUS_LIMITS.categoryName} Zeichen`);
  const dup = existing.find((c) => c.id !== exceptId && fold(c.name).replace(/\s+/g, " ").trim() === fold(n));
  if (dup) throw new HttpError(409, `Die Kategorie „${dup.name}“ gibt es schon.`);
  return n;
}

export async function createCategory(name: string): Promise<string> {
  const db = await getDb();
  const existing = await db.select().from(schema.promptCategories);
  if (existing.length >= FUNDUS_LIMITS.categories) throw new HttpError(400, `Höchstens ${FUNDUS_LIMITS.categories} Kategorien.`);
  const clean = checkCategoryName(name, existing);
  const id = newId("kat", clean);
  const sortOrder = Math.max(0, ...existing.map((c) => c.sortOrder)) + 10;
  await db.insert(schema.promptCategories).values({ id, name: clean, sortOrder });
  await bumpRevision();
  return id;
}

export async function renameCategory(id: string, name: string): Promise<void> {
  const db = await getDb();
  const existing = await db.select().from(schema.promptCategories);
  if (!existing.some((c) => c.id === id)) throw new HttpError(404, "Kategorie nicht gefunden.");
  const clean = checkCategoryName(name, existing, id);
  await db.update(schema.promptCategories).set({ name: clean, updatedAt: new Date() }).where(eq(schema.promptCategories.id, id));
  await bumpRevision();
}

/** Verschiebt einen Eintrag um eine Stelle (Reihenfolge wird dabei auf 10, 20, 30 … gesetzt). */
async function moveInList<T extends { id: string }>(list: T[], id: string, dir: -1 | 1, save: (id: string, sortOrder: number) => Promise<void>) {
  const index = list.findIndex((x) => x.id === id);
  if (index < 0) throw new HttpError(404, "Nicht gefunden.");
  const target = index + dir;
  if (target < 0 || target >= list.length) return;
  const order = list.map((x) => x.id);
  [order[index], order[target]] = [order[target], order[index]];
  for (let i = 0; i < order.length; i++) await save(order[i], (i + 1) * 10);
}

export async function moveCategory(id: string, dir: -1 | 1): Promise<void> {
  const db = await getDb();
  const list = await db.select().from(schema.promptCategories).orderBy(asc(schema.promptCategories.sortOrder), asc(schema.promptCategories.name));
  if (!list.some((c) => c.id === id)) throw new HttpError(404, "Kategorie nicht gefunden.");
  await moveInList(list, id, dir, async (cid, sortOrder) => {
    await db.update(schema.promptCategories).set({ sortOrder }).where(eq(schema.promptCategories.id, cid));
  });
  await bumpRevision();
}

export async function deleteCategory(id: string): Promise<void> {
  const db = await getDb();
  const [cat] = await db.select().from(schema.promptCategories).where(eq(schema.promptCategories.id, id)).limit(1);
  if (!cat) throw new HttpError(404, "Kategorie nicht gefunden.");
  const used = await db.select({ id: schema.prompts.id }).from(schema.prompts).where(eq(schema.prompts.categoryId, id));
  if (used.length) {
    throw new HttpError(409, `„${cat.name}“ enthält noch ${used.length === 1 ? "1 Prompt" : `${nf.format(used.length)} Prompts`} – bitte zuerst verschieben oder löschen.`);
  }
  await db.delete(schema.promptCategories).where(eq(schema.promptCategories.id, id));
  await bumpRevision();
}

// ---------------------------------------------------------------- Prompts

export interface PromptInput {
  title: string;
  categoryId: string;
  description: string;
  text: string;
  placeholders: PlaceholderSettings;
  enabled: boolean;
}

export async function listPrompts(opts: { includeDisabled?: boolean } = {}): Promise<PromptRow[]> {
  const db = await getDb();
  const all = await db.select().from(schema.prompts).orderBy(asc(schema.prompts.sortOrder), asc(schema.prompts.title));
  return opts.includeDisabled ? all : all.filter((p) => p.enabled);
}

async function checkPrompt(input: PromptInput): Promise<{ title: string; description: string; placeholders: PlaceholderSettings }> {
  const title = input.title.replace(/\s+/g, " ").trim();
  if (!title) throw new HttpError(400, "Titel: darf nicht leer sein");
  if (title.length > FUNDUS_LIMITS.promptTitle) throw new HttpError(400, `Titel: höchstens ${FUNDUS_LIMITS.promptTitle} Zeichen`);
  const description = input.description.trim();
  if (description.length > FUNDUS_LIMITS.promptDescription) {
    throw new HttpError(400, `Kurzbeschreibung: höchstens ${FUNDUS_LIMITS.promptDescription} Zeichen`);
  }
  const db = await getDb();
  const cat = await db.select({ id: schema.promptCategories.id }).from(schema.promptCategories).where(eq(schema.promptCategories.id, input.categoryId)).limit(1);
  if (!cat.length) throw new HttpError(400, "Kategorie: bitte eine vorhandene Kategorie wählen.");
  const checked = validatePrompt(input.text, input.placeholders);
  if (checked.errors.length) throw new HttpError(400, checked.errors[0]);
  return { title, description, placeholders: checked.settings };
}

async function nextSortOrder(categoryId: string): Promise<number> {
  const db = await getDb();
  const list = await db.select({ sortOrder: schema.prompts.sortOrder }).from(schema.prompts).where(eq(schema.prompts.categoryId, categoryId));
  return Math.max(0, ...list.map((p) => p.sortOrder)) + 10;
}

export async function createPrompt(input: PromptInput): Promise<string> {
  const db = await getDb();
  const count = await db.select({ id: schema.prompts.id }).from(schema.prompts);
  if (count.length >= FUNDUS_LIMITS.prompts) throw new HttpError(400, `Höchstens ${nf.format(FUNDUS_LIMITS.prompts)} Prompts.`);
  const clean = await checkPrompt(input);
  const id = newId("prompt", clean.title);
  await db.insert(schema.prompts).values({
    id,
    categoryId: input.categoryId,
    title: clean.title,
    description: clean.description,
    text: input.text,
    placeholders: clean.placeholders,
    enabled: input.enabled,
    sortOrder: await nextSortOrder(input.categoryId),
  });
  await bumpRevision();
  return id;
}

export async function updatePrompt(id: string, input: PromptInput): Promise<void> {
  const db = await getDb();
  const [current] = await db.select().from(schema.prompts).where(eq(schema.prompts.id, id)).limit(1);
  if (!current) throw new HttpError(404, "Prompt nicht gefunden.");
  const clean = await checkPrompt(input);
  // Neue Kategorie: der Prompt kommt dort ans Ende.
  const sortOrder = current.categoryId === input.categoryId ? current.sortOrder : await nextSortOrder(input.categoryId);
  await db
    .update(schema.prompts)
    .set({
      categoryId: input.categoryId,
      title: clean.title,
      description: clean.description,
      text: input.text,
      placeholders: clean.placeholders,
      enabled: input.enabled,
      sortOrder,
      updatedAt: new Date(),
    })
    .where(eq(schema.prompts.id, id));
  await bumpRevision();
}

export async function setPromptEnabled(id: string, enabled: boolean): Promise<void> {
  const db = await getDb();
  const updated = await db.update(schema.prompts).set({ enabled, updatedAt: new Date() }).where(eq(schema.prompts.id, id)).returning({ id: schema.prompts.id });
  if (!updated.length) throw new HttpError(404, "Prompt nicht gefunden.");
  await bumpRevision();
}

export async function movePrompt(id: string, dir: -1 | 1): Promise<void> {
  const db = await getDb();
  const [current] = await db.select().from(schema.prompts).where(eq(schema.prompts.id, id)).limit(1);
  if (!current) throw new HttpError(404, "Prompt nicht gefunden.");
  const list = await db
    .select()
    .from(schema.prompts)
    .where(eq(schema.prompts.categoryId, current.categoryId))
    .orderBy(asc(schema.prompts.sortOrder), asc(schema.prompts.title));
  await moveInList(list, id, dir, async (pid, sortOrder) => {
    await db.update(schema.prompts).set({ sortOrder }).where(eq(schema.prompts.id, pid));
  });
  await bumpRevision();
}

export async function deletePrompt(id: string): Promise<void> {
  const db = await getDb();
  const deleted = await db.delete(schema.prompts).where(eq(schema.prompts.id, id)).returning({ id: schema.prompts.id });
  if (!deleted.length) throw new HttpError(404, "Prompt nicht gefunden.");
  await bumpRevision();
}

// ---------------------------------------------------------------- Eigene Dokumente und Verläufe

export async function listOwnItems(): Promise<{ items: OwnItemRow[]; mails: OwnMailRow[] }> {
  const db = await getDb();
  const items = await db.select().from(schema.fundusItems).orderBy(asc(schema.fundusItems.createdAt));
  const mails = await db.select().from(schema.fundusMails).orderBy(asc(schema.fundusMails.threadId), asc(schema.fundusMails.position));
  return { items, mails };
}

export async function getOwnItem(id: string): Promise<OwnItemRow | null> {
  const db = await getDb();
  const [row] = await db.select().from(schema.fundusItems).where(eq(schema.fundusItems.id, id)).limit(1);
  return row ?? null;
}

export async function getOwnMail(id: string): Promise<OwnMailRow | null> {
  const db = await getDb();
  const [row] = await db.select().from(schema.fundusMails).where(eq(schema.fundusMails.id, id)).limit(1);
  return row ?? null;
}

export async function getOwnMails(threadId: string): Promise<OwnMailRow[]> {
  const db = await getDb();
  return db.select().from(schema.fundusMails).where(eq(schema.fundusMails.threadId, threadId)).orderBy(asc(schema.fundusMails.position));
}

/** Gleiche Datei schon im Fundus (eigene Dokumente und Mails)? Liefert den Titel. */
export async function findOwnBySha(sha256: string): Promise<string | null> {
  const db = await getDb();
  const [doc] = await db.select({ title: schema.fundusItems.title }).from(schema.fundusItems).where(eq(schema.fundusItems.sha256, sha256)).limit(1);
  if (doc) return doc.title;
  const [mail] = await db
    .select({ subject: schema.fundusMails.subject, threadId: schema.fundusMails.threadId })
    .from(schema.fundusMails)
    .where(eq(schema.fundusMails.sha256, sha256))
    .limit(1);
  return mail ? `${mail.subject} (E-Mail)` : null;
}

export async function countOwn(kind: "document" | "thread"): Promise<number> {
  const db = await getDb();
  const list = await db
    .select({ id: schema.fundusItems.id })
    .from(schema.fundusItems)
    .where(kind === "document" ? and(eq(schema.fundusItems.kind, "document"), sql`${schema.fundusItems.threadId} IS NULL`) : eq(schema.fundusItems.kind, "thread"));
  return list.length;
}

export interface OwnMeta {
  title: string;
  summary: string;
  date: string;
  tags: LibraryTag[];
  keywords: string[];
  enabled: boolean;
}

export async function updateOwnItem(id: string, meta: OwnMeta): Promise<void> {
  const db = await getDb();
  const current = await getOwnItem(id);
  if (!current) throw new HttpError(404, "Nicht im Fundus gefunden.");
  // Die Länge („Kurz/Mittel/Lang“) bleibt, sie hängt an der Datei.
  const length = (current.tags as LibraryTag[]).filter((t): t is LibraryTag => t === "kurz" || t === "mittel" || t === "lang");
  await db
    .update(schema.fundusItems)
    .set({ title: meta.title, summary: meta.summary, date: meta.date, tags: [...length, ...meta.tags.filter((t) => !length.includes(t))], keywords: meta.keywords, enabled: meta.enabled, updatedAt: new Date() })
    .where(eq(schema.fundusItems.id, id));
  await bumpRevision();
}

/** Löscht ein eigenes Dokument bzw. einen Verlauf mit allen Mails, Anhang-Dokumenten und Dateien. */
export async function deleteOwnItem(id: string): Promise<{ files: number }> {
  const db = await getDb();
  const item = await getOwnItem(id);
  if (!item) throw new HttpError(404, "Nicht im Fundus gefunden.");
  if (item.threadId) throw new HttpError(409, "Dieses Dokument ist ein Anhang eines E-Mail-Verlaufs und geht nur zusammen mit dem Verlauf.");
  const attachments = item.kind === "thread" ? await db.select().from(schema.fundusItems).where(eq(schema.fundusItems.threadId, id)) : [];
  const mails = item.kind === "thread" ? await getOwnMails(id) : [];
  const keys = [item.fileKey, ...attachments.map((a) => a.fileKey), ...mails.map((m) => m.fileKey)].filter((k): k is string => Boolean(k));
  if (attachments.length) await db.delete(schema.fundusItems).where(inArray(schema.fundusItems.id, attachments.map((a) => a.id)));
  await db.delete(schema.fundusItems).where(eq(schema.fundusItems.id, id));
  await deleteFiles(keys);
  await bumpRevision();
  return { files: keys.length };
}

export async function insertOwnItems(items: (typeof schema.fundusItems.$inferInsert)[], mails: (typeof schema.fundusMails.$inferInsert)[] = []): Promise<void> {
  const db = await getDb();
  // Verlauf vor seinen Anhängen und Mails (Fremdschlüssel).
  const ordered = [...items].sort((a, b) => (a.kind === "thread" ? -1 : 0) - (b.kind === "thread" ? -1 : 0));
  for (const item of ordered) await db.insert(schema.fundusItems).values(item);
  for (const mail of mails) await db.insert(schema.fundusMails).values(mail);
  await bumpRevision();
}
