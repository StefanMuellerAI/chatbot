import { readFileSync } from "node:fs";
import type { Page } from "@playwright/test";
import { expectReady } from "../support/files";
import { fakeRequests, type Recorded } from "../support/fake";
import { expect, test, uniq } from "../support/fixtures";
import { fixture } from "../support/generate-files";

// V09 · Eigene PDFs aus dem Fundus bei den Anbietern (Fake-API). Der serielle Server, weil der Test den Fundus ändert.

async function chooseModel(page: Page, name: string) {
  await page.getByRole("button", { name: /^Modell:/ }).click();
  await page.getByRole("listbox", { name: "Modell wählen" }).getByRole("option", { name: new RegExp(`^${name.replace(/\./g, "\\.")}`) }).click();
}

async function streamed(marker: string, path: string): Promise<Recorded> {
  let found: Recorded[] = [];
  await expect(async () => {
    found = (await fakeRequests(marker, path)).filter((r) => r.body.stream === true);
    expect(found.length).toBeGreaterThan(0);
  }).toPass({ timeout: 5_000 });
  return found[0];
}

async function attachOwn(page: Page, id: string) {
  await page.getByRole("button", { name: "Fundus öffnen" }).click();
  const dialog = page.getByRole("dialog", { name: "Fundus" });
  await dialog.getByRole("combobox", { name: "Verwaltung" }).selectOption({ label: "Eigene Inhalte" });
  await dialog.getByRole("listbox", { name: "Dokumente" }).locator(`[data-id="${id}"]`).click();
  await dialog.getByRole("region", { name: "Vorschau" }).getByRole("button", { name: "Anhängen", exact: true }).click();
  await expectReady(page, "Eigener Bericht.pdf", "Fundus · ca.");
}

test("V09 Eigenes PDF aus dem Fundus: nativ an Claude (Dokument) und GPT (Datei) mit den echten Bytes, ohne „PDF nativ“ als Text; Antwort-Cache wie bei Uploads", async ({ chat, page, admin }) => {
  const bytes = readFileSync(fixture("bericht.pdf"));
  await admin.updateSettings({ nativePdf: true });
  const [id] = await admin.addDocuments([{ name: "Eigener Bericht.pdf", data: bytes, meta: { title: `Eigener Bericht ${uniq()}` } }]);
  await page.reload();

  await attachOwn(page, id);
  const claude = uniq();
  await chat.ask(`Eigenes PDF an Claude ${claude}`);
  const content = (await streamed(claude, "/v1/messages")).body.messages[0].content;
  const doc = content.find((b: { type: string }) => b.type === "document");
  expect(doc).toMatchObject({ type: "document", title: "Eigener Bericht.pdf", source: { type: "base64", media_type: "application/pdf" } });
  expect(Buffer.from(doc.source.data, "base64").equals(bytes)).toBe(true);

  // Gleiche Frage, gleiche Datei, neuer Chat: Antwort aus dem Cache (gleiche Prüfsumme wie bei Uploads).
  await chat.newChat();
  await attachOwn(page, id);
  await expect((await chat.ask(`Eigenes PDF an Claude ${claude}`)).getByText("aus dem Cache")).toBeVisible();

  await chat.newChat();
  await chooseModel(page, "GPT-6.1 Sol");
  await attachOwn(page, id);
  const gpt = uniq();
  await chat.ask(`Eigenes PDF an GPT ${gpt}`);
  const input = (await streamed(gpt, "/v1/responses")).body.input[0].content;
  const file = input.find((b: { type: string }) => b.type === "input_file");
  expect(file).toMatchObject({ filename: "Eigener Bericht.pdf" });
  expect(Buffer.from(String(file.file_data).replace(/^data:application\/pdf;base64,/, ""), "base64").equals(bytes)).toBe(true);

  // Ohne „PDF nativ“: der ausgelesene Text.
  await admin.updateSettings({ nativePdf: false });
  await page.reload();
  await chooseModel(page, "Claude Sonnet 5.5");
  await attachOwn(page, id);
  const text = uniq();
  await chat.ask(`Eigenes PDF als Text ${text}`);
  const parts = (await streamed(text, "/v1/messages")).body.messages[0].content as { type: string; text?: string }[];
  expect(parts.some((b) => b.type === "document")).toBe(false);
  expect(parts.some((b) => b.type === "text" && b.text?.includes("Umsatzbericht Seite eins"))).toBe(true);
});
