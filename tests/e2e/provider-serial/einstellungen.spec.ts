import type { Page } from "@playwright/test";
import { expect, test, uniq } from "../support/fixtures";
import { FAKE_USAGE, fakeRequests, type Recorded } from "../support/fake";
import { attach, expectReady } from "../support/files";

// Admin-Einstellungen, die erst in der Anfrage an den Anbieter sichtbar werden.

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

interface Overview {
  periods: { requests: number; costUsd: number; savedUsd: number }[];
  byModel: { modelId: string; requests: number; costUsd: number; savedUsd: number; cacheReadTokens: number; cacheWriteTokens: number }[];
  byFeature: { feature: string; count: number; costUsd: number }[];
}

const usd = (n: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "USD", maximumFractionDigits: n < 0.1 ? 4 : 2 }).format(n);

test("Q10/V01 Kosten pro Antwort und Übersicht rechnen mit den Modellpreisen", async ({ chat, page, admin }) => {
  await admin.setFeatures({ showCost: true });
  const models = await admin.models();
  const sonnet = models.find((m) => m.id === "claude-sonnet-5-5") as { priceIn: number; priceOut: number; priceCacheRead: number; priceCacheWrite: number };
  const cost =
    (FAKE_USAGE.input * sonnet.priceIn + FAKE_USAGE.output * sonnet.priceOut + FAKE_USAGE.cacheRead * sonnet.priceCacheRead + FAKE_USAGE.cacheWrite * sonnet.priceCacheWrite) / 1e6;
  const saved = (FAKE_USAGE.cacheRead * (sonnet.priceIn - sonnet.priceCacheRead)) / 1e6;
  const before = await admin.json<Overview>("GET", "/api/admin/overview");

  await page.reload();
  const answer = await chat.ask(`Was kostet das? ${uniq()}`);
  await expect(answer.getByText(`${usd(cost)} · 4.000 Tokens aus Cache`)).toBeVisible();
  // Websuche kostet zusätzlich 1 Cent pro Suche.
  const web = await chat.ask(`#fake:websuche ${uniq()}`);
  await expect(web.getByText(`${usd(cost + 0.01)} · 4.000 Tokens aus Cache`)).toBeVisible();

  const after = await admin.json<Overview>("GET", "/api/admin/overview");
  const row = (o: Overview) => o.byModel.find((m) => m.modelId === "claude-sonnet-5-5") ?? { requests: 0, costUsd: 0, savedUsd: 0, cacheReadTokens: 0, cacheWriteTokens: 0 };
  expect(row(after).requests - row(before).requests).toBe(2);
  expect(row(after).costUsd - row(before).costUsd).toBeCloseTo(2 * cost + 0.01, 6);
  expect(row(after).savedUsd - row(before).savedUsd).toBeCloseTo(2 * saved, 6);
  expect(row(after).cacheReadTokens - row(before).cacheReadTokens).toBe(2 * FAKE_USAGE.cacheRead);
  expect(row(after).cacheWriteTokens - row(before).cacheWriteTokens).toBe(2 * FAKE_USAGE.cacheWrite);
  expect(after.periods[0].costUsd - before.periods[0].costUsd).toBeGreaterThanOrEqual(2 * cost + 0.01 - 1e-9);

  // Ein Treffer im Antwort-Cache kostet nichts und zählt als Ersparnis.
  await chat.newChat();
  const question = `Zweimal gefragt ${uniq()}`;
  await chat.ask(question);
  const mid = await admin.json<Overview>("GET", "/api/admin/overview");
  await chat.newChat();
  const hit = await chat.ask(question);
  await expect(hit.getByText("aus dem Cache")).toBeVisible();
  const end = await admin.json<Overview>("GET", "/api/admin/overview");
  expect(row(end).costUsd - row(mid).costUsd).toBeCloseTo(0, 9);
  expect(end.periods[0].savedUsd - mid.periods[0].savedUsd).toBeCloseTo(cost, 6);
});

test("Q11 Claude-Cache-Dauer 1 Stunde setzt die TTL an allen Cache-Markern", async ({ chat, page, admin }) => {
  await admin.updateSettings({ claudeCacheTtl: "1h" });
  await page.reload();
  const id = uniq();
  await chat.ask(`Lange cachen ${id}`);
  const body = (await streamed(id, "/v1/messages")).body;
  expect(body.cache_control).toEqual({ type: "ephemeral", ttl: "1h" });
  for (const block of body.system) expect(block.cache_control).toEqual({ type: "ephemeral", ttl: "1h" });
});

test("Q19/L01 Kursleitungs-Hinweis und Vorlage landen im System-Prompt beider Anbieter", async ({ chat, page, admin }) => {
  await admin.updateSettings({ systemPromptAddendum: "Antworte immer mit einem Smiley." });
  await page.reload();
  await page.getByRole("button", { name: /^E-Mail-Profi/ }).click();
  const claude = uniq();
  await chat.ask(`Mit Vorlage ${claude}`);
  const c = (await streamed(claude, "/v1/messages")).body;
  expect(c.system).toHaveLength(2);
  expect(c.system[0].text).toContain("Antworte immer mit einem Smiley.");
  expect(c.system[1].text).toMatch(/^Rolle: Du bist ein erfahrener Kommunikationsprofi/);

  await chat.newChat();
  await page.getByRole("button", { name: /^E-Mail-Profi/ }).click();
  await chooseModel(page, "GPT-6.1 Sol");
  const gpt = uniq();
  await chat.ask(`Mit Vorlage ${gpt}`);
  const g = (await streamed(gpt, "/v1/responses")).body;
  expect(g.instructions).toContain("Antworte immer mit einem Smiley.");
  expect(g.instructions).toMatch(/\n\n# Rolle für dieses Gespräch\nRolle: Du bist ein erfahrener Kommunikationsprofi/);
});

test("Q14 Bildmodell und Bild-Vorgaben gehen an die Bild-API", async ({ chat, page, admin }) => {
  await admin.updateSettings({ imageModel: "gpt-image-2-mini", imageDefaultQuality: "low", imageDefaultSize: "1536x1024" });
  await page.reload();
  await page.getByRole("button", { name: "Bild-Modus" }).click();
  const prompt = `Vorgaben ${uniq()}`;
  await page.getByLabel("Bildbeschreibung").fill(prompt);
  await page.getByRole("button", { name: "Bild erzeugen" }).click();
  await expect(chat.lastAnswer.getByRole("img", { name: prompt })).toBeVisible();
  const [request] = await fakeRequests(prompt, "/v1/images/generations");
  expect(request.body).toEqual({ model: "gpt-image-2-mini", prompt, size: "1536x1024", quality: "low", n: 1 });

  // Auch das Bild-Werkzeug im Chat nutzt das eingestellte Modell.
  const tool = uniq();
  await chat.ask(`#fake:bild ${tool}`);
  const [viaTool] = await fakeRequests(tool, "/v1/images/generations");
  expect(viaTool.body.model).toBe("gpt-image-2-mini");
});

test("Q15/H01 Transkriptions- und Diktiermodell werden verwendet", async ({ chat, page, admin }) => {
  await admin.updateSettings({ transcriptionModel: "gpt-transcribe-mini", dictationModel: "gpt-diktat" });
  await page.reload();
  await attach(page, "ton.wav");
  await expectReady(page, "ton.wav", /Tokens|Transkript/);
  const id = uniq();
  await chat.ask(`Was steht im Transkript? ${id}`);
  expect(JSON.stringify((await streamed(id, "/v1/messages")).body.messages)).toContain("Fake-Transkript (gpt-transcribe-mini, teil-0.mp3,");

  await page.getByRole("button", { name: "Spracheingabe" }).click();
  const stop = page.getByRole("button", { name: "Aufnahme beenden" });
  await expect(stop).toContainText(/0:0[2-9]/, { timeout: 10_000 });
  await stop.click();
  await expect(chat.composer).toHaveValue(/^Fake-Transkript \(gpt-diktat, diktat\.(webm|ogg|m4a),/, { timeout: 20_000 });
});

test("Q16 Titelmodell von OpenAI erzeugt den Chat-Titel", async ({ chat, page, admin }) => {
  await admin.updateSettings({ titleModelId: "gpt-6-luna" });
  await page.reload();
  const id = uniq();
  await chat.ask(`Titel von GPT ${id}`);
  await expect(page.getByRole("navigation", { name: "Chatverlauf" }).getByRole("button", { name: /^Fake-Titel/ })).toBeVisible();
  const title = (await fakeRequests(id, "/v1/responses")).find((r) => !r.body.stream);
  expect(title?.body).toMatchObject({ model: "gpt-6-luna", store: false, max_output_tokens: 2000, reasoning: { effort: "low" } });
});

test("Q17 PDFs nativ: Claude bekommt ein Dokument, GPT eine Datei", async ({ chat, page, admin }) => {
  await admin.updateSettings({ nativePdf: true });
  await page.reload();
  await attach(page, "bericht.pdf");
  await expectReady(page, "bericht.pdf", /Tokens/);
  const claude = uniq();
  await chat.ask(`PDF an Claude ${claude}`);
  const content = (await streamed(claude, "/v1/messages")).body.messages[0].content;
  expect(content.find((b: { type: string }) => b.type === "document")).toMatchObject({
    type: "document",
    title: "bericht.pdf",
    source: { type: "base64", media_type: "application/pdf", data: expect.stringMatching(/^JVBERi0/) },
  });

  await chat.newChat();
  await chooseModel(page, "GPT-6.1 Sol");
  await attach(page, "bericht.pdf");
  await expectReady(page, "bericht.pdf", /Tokens/);
  const gpt = uniq();
  await chat.ask(`PDF an GPT ${gpt}`);
  const input = (await streamed(gpt, "/v1/responses")).body.input[0].content;
  expect(input.find((b: { type: string }) => b.type === "input_file")).toMatchObject({ filename: "bericht.pdf", file_data: expect.stringMatching(/^data:application\/pdf;base64,JVBERi0/) });
});
