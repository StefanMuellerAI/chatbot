import { eq, sql } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { getDb, schema, seedPrompts } from "@/lib/db/client";
import { SEED_PROMPT_CATEGORIES, SEED_PROMPTS } from "@/lib/db/seed";
import {
  bumpRevision,
  createCategory,
  createPrompt,
  deleteCategory,
  deletePrompt,
  fundusRevision,
  insertOwnItems,
  listCategories,
  listHidden,
  listPrompts,
  moveCategory,
  movePrompt,
  newId,
  renameCategory,
  setHidden,
  setPromptEnabled,
  showAllHidden,
  slug,
  updatePrompt,
} from "@/lib/fundus/store";
import { LIBRARY_ID } from "@/lib/library/types";
import { saveDocuments } from "@/lib/fundus/upload";
import { FUNDUS_LIMITS } from "@/lib/shared/fundus";

const unique = (name: string) => `${name} ${Math.random().toString(36).slice(2, 8)}`;

describe("Fundus pflegen: IDs", () => {
  it("bildet lesbare IDs aus Titeln (ä = ae, nur a–z, 0–9 und Bindestrich)", () => {
    expect(slug("Bürgeranfrage – Übersicht 2026!")).toBe("buergeranfrage-uebersicht-2026");
    expect(slug("Straße & Größe")).toBe("strasse-groesse");
    expect(slug("   ")).toBe("eintrag");
    expect(slug("Отчет 📊")).toBe("eintrag");
    expect(slug("a".repeat(80)).length).toBeLessThanOrEqual(40);
    for (const title of ["Leitfaden KI", "x", "-führend-", "a".repeat(200), "€€€"]) {
      const id = newId("eigen", title);
      expect(id, title).toMatch(LIBRARY_ID);
      expect(id.startsWith("eigen-")).toBe(true);
      expect(`${id}-50`).toMatch(LIBRARY_ID);
    }
    expect(newId("eigen", "gleich")).not.toBe(newId("eigen", "gleich"));
  });
});

describe("Fundus pflegen: Startbestand", () => {
  it("legt 12 Prompts in 6 Kategorien genau einmal an", async () => {
    const cats = await listCategories();
    for (const c of SEED_PROMPT_CATEGORIES) expect(cats.find((x) => x.id === c.id)?.name).toBe(c.name);
    const prompts = await listPrompts({ includeDisabled: true });
    for (const p of SEED_PROMPTS) expect(prompts.find((x) => x.id === p.id)?.title).toBe(p.title);
    expect(SEED_PROMPTS).toHaveLength(12);
    expect(SEED_PROMPT_CATEGORIES).toHaveLength(6);
    const db = await getDb();
    const marker = await db.select().from(schema.settings).where(eq(schema.settings.key, "fundus-start"));
    expect(marker).toHaveLength(1);
    // Gelöscht bleibt gelöscht, auch wenn die Startbelegung erneut läuft (Kaltstart).
    await db.delete(schema.prompts).where(eq(schema.prompts.id, "prompt-absage"));
    await seedPrompts(db);
    expect((await listPrompts({ includeDisabled: true })).some((p) => p.id === "prompt-absage")).toBe(false);
  });

  it("Start-Prompts sind gültig (Platzhalter, Auswahlwerte, Standardwerte)", async () => {
    const { validatePrompt } = await import("@/lib/shared/placeholders");
    for (const p of SEED_PROMPTS) expect(validatePrompt(p.text, p.placeholders).errors, p.id).toEqual([]);
  });
});

describe("Fundus pflegen: Revision", () => {
  it("steigt mit jeder Änderung", async () => {
    const before = await fundusRevision();
    await bumpRevision();
    expect(await fundusRevision()).toBe(before + 1);
    await createCategory(unique("Revision"));
    expect(await fundusRevision()).toBe(before + 2);
  });
});

describe("Fundus pflegen: Kategorien", () => {
  it("legt an, benennt um und lehnt Dubletten ab (groß/klein, ä/ae, Leerzeichen)", async () => {
    const name = unique("Präsentieren");
    const id = await createCategory(`  ${name}  `);
    expect((await listCategories()).find((c) => c.id === id)?.name).toBe(name);
    await expect(createCategory(name.toUpperCase())).rejects.toThrow(`Die Kategorie „${name}“ gibt es schon.`);
    await expect(createCategory(name.replace("ä", "ae"))).rejects.toThrow("gibt es schon");
    await expect(createCategory(name.replace(" ", "   "))).rejects.toThrow("gibt es schon");
    await expect(createCategory("   ")).rejects.toThrow("Name: darf nicht leer sein");
    await expect(createCategory("x".repeat(41))).rejects.toThrow("höchstens 40 Zeichen");
    await renameCategory(id, `${name} neu`);
    expect((await listCategories()).find((c) => c.id === id)?.name).toBe(`${name} neu`);
    await expect(renameCategory(id, "Schreiben")).rejects.toThrow("gibt es schon");
    await expect(renameCategory("kat-gibt-es-nicht", "x")).rejects.toThrow("Kategorie nicht gefunden.");
  });

  it("verschiebt um eine Stelle und bleibt am Rand stehen", async () => {
    const before = (await listCategories()).map((c) => c.id);
    const second = before[1];
    await moveCategory(second, -1);
    const after = (await listCategories()).map((c) => c.id);
    expect(after[0]).toBe(second);
    expect(after[1]).toBe(before[0]);
    await moveCategory(second, -1);
    expect((await listCategories()).map((c) => c.id)).toEqual(after);
    await moveCategory(second, 1);
    expect((await listCategories()).map((c) => c.id)).toEqual(before);
  });

  it("löscht nur leere Kategorien (409 nennt die Zahl)", async () => {
    await expect(deleteCategory("kat-schreiben")).rejects.toThrow(/„Schreiben“ enthält noch \d+ Prompts? – bitte zuerst verschieben oder löschen\./);
    const id = await createCategory(unique("Leer"));
    await deleteCategory(id);
    expect((await listCategories()).some((c) => c.id === id)).toBe(false);
    await expect(deleteCategory(id)).rejects.toThrow("Kategorie nicht gefunden.");
  });
});

describe("Fundus pflegen: Prompts", () => {
  const base = { description: "", placeholders: {}, enabled: true };

  it("legt an, prüft und speichert nur Einstellungen der Platzhalter im Text", async () => {
    const id = await createPrompt({
      ...base,
      title: "  Testprompt  ",
      categoryId: "kat-auswerten",
      text: "Werte {{Datei}} für {{Zielgruppe}} aus.",
      placeholders: { zielgruppe: { hint: " z. B. Rat " }, weg: { label: "nicht im Text" } },
    });
    const row = (await listPrompts({ includeDisabled: true })).find((p) => p.id === id)!;
    expect(row.title).toBe("Testprompt");
    expect(row.placeholders).toEqual({ datei: {}, zielgruppe: { hint: "z. B. Rat" } });
    const sorted = (await listPrompts({ includeDisabled: true })).filter((p) => p.categoryId === "kat-auswerten");
    expect(sorted.at(-1)?.id).toBe(id);
  });

  it("lehnt ungültige Prompts mit deutscher Meldung ab", async () => {
    const ok = { ...base, title: "T", categoryId: "kat-schreiben", text: "Hallo {{Name}}" };
    await expect(createPrompt({ ...ok, title: " " })).rejects.toThrow("Titel: darf nicht leer sein");
    await expect(createPrompt({ ...ok, title: "x".repeat(81) })).rejects.toThrow("Titel: höchstens 80 Zeichen");
    await expect(createPrompt({ ...ok, description: "x".repeat(201) })).rejects.toThrow("Kurzbeschreibung: höchstens 200 Zeichen");
    await expect(createPrompt({ ...ok, categoryId: "kat-weg" })).rejects.toThrow("Kategorie: bitte eine vorhandene Kategorie wählen.");
    await expect(createPrompt({ ...ok, text: "" })).rejects.toThrow("Prompt-Text: darf nicht leer sein");
    await expect(createPrompt({ ...ok, placeholders: { name: { type: "select", options: ["a"] } } })).rejects.toThrow("mindestens 2 Werte");
  });

  it("ändert, wechselt die Kategorie (ans Ende), verschiebt, schaltet und löscht", async () => {
    const a = await createPrompt({ ...base, title: "A", categoryId: "kat-recherche", text: "A {{X}}" });
    const b = await createPrompt({ ...base, title: "B", categoryId: "kat-recherche", text: "B" });
    await movePrompt(b, -1);
    let ids = (await listPrompts({ includeDisabled: true })).filter((p) => p.categoryId === "kat-recherche").map((p) => p.id);
    expect(ids.indexOf(b)).toBeLessThan(ids.indexOf(a));
    await updatePrompt(a, { ...base, title: "A2", categoryId: "kat-prompten-lernen", text: "A2" });
    ids = (await listPrompts({ includeDisabled: true })).filter((p) => p.categoryId === "kat-prompten-lernen").map((p) => p.id);
    expect(ids.at(-1)).toBe(a);
    await setPromptEnabled(a, false);
    expect((await listPrompts()).some((p) => p.id === a)).toBe(false);
    expect((await listPrompts({ includeDisabled: true })).some((p) => p.id === a)).toBe(true);
    await deletePrompt(a);
    await expect(deletePrompt(a)).rejects.toThrow("Prompt nicht gefunden.");
    await expect(updatePrompt(a, { ...base, title: "x", categoryId: "kat-recherche", text: "x" })).rejects.toThrow("Prompt nicht gefunden.");
  });

  it("begrenzt auf 500 Prompts", async () => {
    const db = await getDb();
    const existing = (await listPrompts({ includeDisabled: true })).length;
    const fill = Array.from({ length: FUNDUS_LIMITS.prompts - existing }, (_, i) => ({
      id: `prompt-fuellung-${i}`,
      categoryId: "kat-recherche",
      title: `Füllung ${i}`,
      text: "x",
      placeholders: {},
    }));
    for (let i = 0; i < fill.length; i += 100) await db.insert(schema.prompts).values(fill.slice(i, i + 100));
    await expect(createPrompt({ ...base, title: "zu viel", categoryId: "kat-recherche", text: "x" })).rejects.toThrow("Höchstens 500 Prompts.");
    await db.execute(sql`DELETE FROM prompts WHERE id LIKE 'prompt-fuellung-%'`);
  });
});

describe("Fundus pflegen: Ausblenden und Grenzen", () => {
  it("blendet mitgelieferte Einträge aus und wieder ein", async () => {
    await setHidden("fb-beschlussvorlage-kita-nordstadt", true);
    await setHidden("fb-beschlussvorlage-kita-nordstadt", true);
    expect(await listHidden()).toContain("fb-beschlussvorlage-kita-nordstadt");
    await setHidden("fb-beschlussvorlage-kita-nordstadt", false);
    expect(await listHidden()).not.toContain("fb-beschlussvorlage-kita-nordstadt");
    await setHidden("bh-beschwerde-laerm-dgh", true);
    expect(await showAllHidden()).toBeGreaterThanOrEqual(1);
    expect(await listHidden()).toEqual([]);
  });

  it("begrenzt eigene Dokumente auf 500 (nichts halb angelegt)", async () => {
    const db = await getDb();
    const rows = Array.from({ length: FUNDUS_LIMITS.documents }, (_, i) => ({
      id: `eigen-grenze-${i}`,
      kind: "document",
      title: `Grenze ${i}`,
      date: "2026-10-14",
      tags: [],
      keywords: [],
      docType: "word",
      enabled: true,
    }));
    for (let i = 0; i < rows.length; i += 100) await db.insert(schema.fundusItems).values(rows.slice(i, i + 100));
    await expect(saveDocuments([{ key: "fundus/00000000-0000-0000-0000-000000000000/x.docx", name: "x.docx", meta: { title: "x", summary: "", date: "2026-10-14", tags: [], keywords: [] } }])).rejects.toThrow(
      "Höchstens 500 eigene Dokumente – im Fundus sind schon 500.",
    );
    await db.execute(sql`DELETE FROM fundus_items WHERE id LIKE 'eigen-grenze-%'`);
    await insertOwnItems([]);
  });
});
