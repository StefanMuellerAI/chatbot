import { expect, test, uniq } from "../support/fixtures";
import { fakeRequests, type Recorded } from "../support/fake";
import { guestApi, mailGroup } from "../support/mail";
import { askFreebie, groupChatOf, postMessage, startGroupChat } from "../support/groupchat";

// V08: Gruppenchats an echten Adaptern (Fake-API). Beiträge gehen mit Autor und Uhrzeit an das Modell;
// über drei Runden mit Beiträgen dazwischen bleibt der Präfix byte-gleich – auch wenn verschiedene
// Mitglieder fragen.

const json = (v: unknown) => JSON.stringify(v);

async function rounds(marker: string, path: string, count: number): Promise<Recorded[]> {
  let found: Recorded[] = [];
  await expect(async () => {
    found = (await fakeRequests(marker, path)).filter((r) => r.body.stream === true).sort((a, b) => a.at - b.at);
    expect(found).toHaveLength(count);
  }).toPass({ timeout: 5_000 });
  return found;
}

/** Drei Runden: A und B posten, B fragt; A postet zweimal und fragt; B fragt. */
async function threeRounds(baseURL: string, ip: string, admin: Parameters<typeof mailGroup>[0], modelId: string) {
  const {
    guests: [a, b],
  } = await mailGroup(admin, 2);
  const [apiA, apiB] = await Promise.all([a, b].map((g) => guestApi(baseURL, ip, g)));
  const marker = uniq();
  const chat = await startGroupChat(apiA, `Caching ${marker}`, [b.username]);
  const ask = async (api: typeof apiA, model = modelId) => {
    const res = await askFreebie(api, chat.id, model, { effort: "medium", webSearch: false });
    expect(res.status, res.body).toBe(200);
    expect(res.body).toContain('"type":"done"');
  };
  await postMessage(apiA, chat.id, `TOP 1: Raumplanung ${marker}`);
  await postMessage(apiB, chat.id, "@Freebie fasse zusammen");
  await ask(apiB);
  await postMessage(apiA, chat.id, "TOP 2: Budget");
  await postMessage(apiA, chat.id, "@Freebie ergänze das Protokoll");
  await ask(apiA);
  await postMessage(apiB, chat.id, "@Freebie Aufgabenliste?");
  await ask(apiB);
  return { a, b, apiA, apiB, chat, marker, ask };
}

const nachricht = (author: string, text: string) => new RegExp(`<nachricht von="${author}" zeit="\\d{2}:\\d{2}">\\n${text}\\n</nachricht>`);

test("V08 Claude im Gruppenchat: Beiträge mit Autor und Uhrzeit, Präfix über drei Runden byte-gleich, anderes Modell eines Mitglieds geht", async ({ admin, baseURL, ip }) => {
  const { a, b, apiA, apiB, chat, marker, ask } = await threeRounds(baseURL!, ip, admin, "claude-sonnet-5-5");
  const [r1, r2, r3] = (await rounds(marker, "/v1/messages", 3)).map((r) => r.body);

  // Runde 1: beide Beiträge in einer Nutzernachricht.
  expect(r1.messages).toHaveLength(1);
  const first = r1.messages[0].content.map((c: { text?: string }) => c.text ?? "").join("");
  expect(first).toMatch(nachricht(a.username, `TOP 1: Raumplanung ${marker}`));
  expect(first).toMatch(nachricht(b.username, "@Freebie fasse zusammen"));

  for (const r of [r2, r3]) {
    expect(json(r.system)).toBe(json(r1.system));
    expect(json(r.tools)).toBe(json(r1.tools));
    expect(r.cache_control).toEqual({ type: "ephemeral" });
    expect(r.output_config).toEqual({ effort: "medium" });
  }
  expect(r1.system.every((s: { cache_control?: unknown }) => s.cache_control)).toBe(true);
  expect(json(r1.system)).toContain("# Gruppenchats");
  // Präfix: jede Runde beginnt exakt mit allen Nachrichten der vorigen.
  expect(json(r2.messages.slice(0, r1.messages.length))).toBe(json(r1.messages));
  expect(json(r3.messages.slice(0, r2.messages.length))).toBe(json(r2.messages));
  expect(r2.messages.map((m: { role: string }) => m.role)).toEqual(["user", "assistant", "user"]);
  expect(r3.messages).toHaveLength(5);
  // Die beiden Beiträge von A zwischen den Antworten bilden eine Runde.
  const round2 = r2.messages[2].content.map((c: { text?: string }) => c.text ?? "").join("");
  expect(round2).toMatch(nachricht(a.username, "TOP 2: Budget"));
  expect(round2).toMatch(nachricht(a.username, "@Freebie ergänze das Protokoll"));

  // Ein Mitglied fragt mit GPT: die bisherigen Antworten gehen als Text an das andere Modell.
  await postMessage(apiA, chat.id, "@Freebie jetzt mit GPT");
  await ask(apiA, "gpt-6-1-sol");
  const [gpt] = await rounds(marker, "/v1/responses", 1);
  expect(gpt.body.input.filter((i: { role?: string }) => i.role === "assistant")).toEqual(
    Array.from({ length: 3 }, () => ({ role: "assistant", content: "Fake-Antwort von claude-sonnet-5-5." })),
  );
  const answers = (await groupChatOf(apiB, chat.id)).messages.filter((m) => m.kind === "freebie");
  expect(answers.map((m) => m.status)).toEqual(["done", "done", "done", "done"]);
  await Promise.all([apiA.dispose(), apiB.dispose()]);
});

test("V08 GPT im Gruppenchat: Anweisungen, Werkzeuge, Verlauf und ein Cache-Schlüssel für alle Mitglieder", async ({ admin, baseURL, ip }) => {
  const { apiA, apiB, marker } = await threeRounds(baseURL!, ip, admin, "gpt-6-1-sol");
  const recorded = await rounds(marker, "/v1/responses", 3);
  const [r1, r2, r3] = recorded.map((r) => r.body);
  for (const r of [r2, r3]) {
    expect(r.instructions).toBe(r1.instructions);
    expect(json(r.tools)).toBe(json(r1.tools));
    // B fragt in Runde 1 und 3, A in Runde 2 – derselbe Schlüssel.
    expect(r.prompt_cache_key).toBe(r1.prompt_cache_key);
  }
  expect(r1.prompt_cache_key).toMatch(/^freebie-gc-/);
  expect(json(r2.input.slice(0, r1.input.length))).toBe(json(r1.input));
  expect(json(r3.input.slice(0, r2.input.length))).toBe(json(r2.input));
  await Promise.all([apiA.dispose(), apiB.dispose()]);
});

test("GC03 Beiträge ohne @Freebie: keine Anfrage an den Anbieter", async ({ admin, baseURL, ip }) => {
  const {
    guests: [a, b],
  } = await mailGroup(admin, 2);
  const apiA = await guestApi(baseURL!, ip, a);
  const marker = uniq();
  const chat = await startGroupChat(apiA, `Still ${marker}`, [b.username]);
  for (let i = 0; i < 3; i++) await postMessage(apiA, chat.id, `Notiz ${i} ${marker}`);
  // Auch ein „@Freebie“ ohne Aufruf von /freebie fragt nicht (das macht der Browser nur bei einer Erwähnung).
  await postMessage(apiA, chat.id, `freebie@example.de ist keine Erwähnung ${marker}`);
  await new Promise((r) => setTimeout(r, 500));
  expect(await fakeRequests(marker)).toEqual([]);
  const res = await askFreebie(apiA, chat.id, "claude-sonnet-5-5");
  expect(res.status).toBe(400);
  expect(await fakeRequests(marker)).toEqual([]);
  await apiA.dispose();
});
