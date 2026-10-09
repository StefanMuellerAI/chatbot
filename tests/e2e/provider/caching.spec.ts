import type { Page } from "@playwright/test";
import { expect, test, uniq } from "../support/fixtures";
import { fakeRequests, type Recorded } from "../support/fake";

// V05: Der Caching-Vertrag. Jede Folgeanfrage muss den bisherigen Verlauf byte-gleich
// wiederholen – sonst zahlt jede Runde wieder den vollen Preis für den ganzen Chat.

async function chooseModel(page: Page, name: string) {
  await page.getByRole("button", { name: /^Modell:/ }).click();
  await page.getByRole("listbox", { name: "Modell wählen" }).getByRole("option", { name: new RegExp(`^${name.replace(/\./g, "\\.")}`) }).click();
}

async function chooseEffort(page: Page, label: string) {
  await page.getByRole("button", { name: /^Denktiefe:/ }).click();
  await page.getByRole("menuitemradio", { name: new RegExp(`^${label}`) }).click();
  await expect(page.getByRole("button", { name: /^Denktiefe:/ })).toHaveAccessibleName(`Denktiefe: ${label}`);
}

async function rounds(marker: string, path: string, count: number): Promise<Recorded[]> {
  let found: Recorded[] = [];
  await expect(async () => {
    found = (await fakeRequests(marker, path)).filter((r) => r.body.stream === true).sort((a, b) => a.at - b.at);
    expect(found).toHaveLength(count);
  }).toPass({ timeout: 5_000 });
  return found;
}

/** Drei Runden im selben Chat, vor der dritten wird die Denktiefe erhöht. */
async function threeRounds(chat: { ask: (t: string) => Promise<unknown> }, page: Page, marker: string) {
  await chat.ask(`Erste Frage ${marker}`);
  await chat.ask(`Zweite Frage ${uniq()}`);
  await chooseEffort(page, "Hoch");
  await chat.ask(`Dritte Frage ${uniq()}`);
}

const json = (v: unknown) => JSON.stringify(v);

test("V05 Claude: System, Werkzeuge und Verlauf bleiben über drei Runden byte-gleich", async ({ chat, page }) => {
  await chooseModel(page, "Claude Sonnet 5.5");
  const marker = uniq();
  await threeRounds(chat, page, marker);
  const [r1, r2, r3] = (await rounds(marker, "/v1/messages", 3)).map((r) => ({ ...r.body, betas: r.headers["anthropic-beta"] }));

  for (const r of [r2, r3]) {
    expect(json(r.system)).toBe(json(r1.system));
    expect(json(r.tools)).toBe(json(r1.tools));
    expect(r.cache_control).toEqual(r1.cache_control);
    // Die Denktiefe oben bleibt die der ersten Nachricht – ein Wechsel würde den Präfix brechen.
    expect(r.output_config).toEqual({ effort: "medium" });
  }
  expect(r1.system.every((b: { cache_control?: unknown }) => b.cache_control)).toBe(true);
  expect(r1.cache_control).toEqual({ type: "ephemeral" });

  // Präfix: jede Runde beginnt exakt mit allen Nachrichten der vorigen.
  expect(json(r2.messages.slice(0, r1.messages.length))).toBe(json(r1.messages));
  expect(json(r3.messages.slice(0, r2.messages.length))).toBe(json(r2.messages));

  // Die Antwort geht mit Gedankengang und Signatur zurück (Preserved Thinking).
  const assistant = r2.messages[1];
  expect(assistant.role).toBe("assistant");
  expect(assistant.content[0]).toMatchObject({ type: "thinking", signature: "fake-signatur" });
  expect(assistant.content.at(-1)).toMatchObject({ type: "text", text: "Fake-Antwort von claude-sonnet-5-5." });

  // Effort-Wechsel als eigene System-Nachricht direkt vor der neuen Frage.
  const added = r3.messages.slice(r2.messages.length);
  expect(added.map((m: { role: string }) => m.role)).toEqual(["assistant", "system", "user"]);
  expect(added[1]).toEqual({ role: "system", content: [], output_config: { effort: "high" } });
  expect(r3.betas).toContain("mid-conversation-output-config-2026-07-01");
  expect(r2.betas).not.toContain("mid-conversation-output-config-2026-07-01");
  expect(r3.max_tokens).toBe(64000);
});

test("V05 GPT: Anweisungen, Werkzeuge, Verlauf und Cache-Schlüssel bleiben gleich", async ({ chat, page }) => {
  await chooseModel(page, "GPT-6.1 Sol");
  const marker = uniq();
  await threeRounds(chat, page, marker);
  const [r1, r2, r3] = (await rounds(marker, "/v1/responses", 3)).map((r) => r.body);

  for (const r of [r2, r3]) {
    expect(r.instructions).toBe(r1.instructions);
    expect(json(r.tools)).toBe(json(r1.tools));
    expect(r.prompt_cache_key).toBe(r1.prompt_cache_key);
    expect(r.reasoning).toEqual({ effort: "medium", summary: "auto" });
  }
  expect(json(r2.input.slice(0, r1.input.length))).toBe(json(r1.input));
  expect(json(r3.input.slice(0, r2.input.length))).toBe(json(r2.input));

  // Verschlüsselter Gedankengang wird zurückgegeben.
  expect(r2.input[1]).toMatchObject({ type: "reasoning", encrypted_content: "fake-verschluesselt" });
  const added = r3.input.slice(r2.input.length);
  expect(added.map((i: { type?: string; role?: string }) => i.type ?? i.role)).toEqual(["reasoning", "message", "configuration_update", "user"]);
  expect(added[2]).toEqual({ type: "configuration_update", reasoning: { effort: "high" } });

  // Ein neuer Chat bekommt einen eigenen Cache-Schlüssel.
  await chat.newChat();
  const other = uniq();
  await chat.ask(`Anderer Chat ${other}`);
  const [o] = await rounds(other, "/v1/responses", 1);
  expect(o.body.prompt_cache_key).not.toBe(r1.prompt_cache_key);
});

test("V05 Modellwechsel mitten im Chat: frühere Antworten gehen als Text an das neue Modell", async ({ chat, page }) => {
  await chooseModel(page, "Claude Sonnet 5.5");
  const marker = uniq();
  await chat.ask(`Start bei Claude ${marker}`);
  await chooseModel(page, "GPT-6.1 Sol");
  await chat.ask(`Weiter bei GPT ${uniq()}`);
  const [gpt] = await rounds(marker, "/v1/responses", 1);
  expect(gpt.body.input[1]).toEqual({ role: "assistant", content: "Fake-Antwort von claude-sonnet-5-5." });
});
