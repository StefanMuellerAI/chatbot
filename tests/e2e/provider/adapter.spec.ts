import type { Page } from "@playwright/test";
import { expect, openAdmin, test, uniq } from "../support/fixtures";
import { fakeRequests, type Recorded } from "../support/fake";
import { attach, expectReady, payload } from "../support/files";

// Jeder Test läuft gegen die nachgebaute Anbieter-API (tests/e2e/fake-api/server.mjs).
const MODELS = [
  { name: "Claude Sonnet 5.5", modelId: "claude-sonnet-5-5", provider: "anthropic" },
  { name: "GPT-6.1 Sol", modelId: "gpt-6.1-sol", provider: "openai" },
] as const;

async function chooseModel(page: Page, name: string) {
  const picker = page.getByRole("button", { name: /^Modell:/ });
  await picker.click();
  await page.getByRole("listbox", { name: "Modell wählen" }).getByRole("option", { name: new RegExp(`^${name.replace(/\./g, "\\.")}`) }).click();
  await expect(picker).toHaveAccessibleName(`Modell: ${name}`);
}

/** Gestreamte Chat-Anfragen (ohne Titel- und Testanfragen), älteste zuerst. */
async function chatRequests(marker: string, provider: "anthropic" | "openai"): Promise<Recorded[]> {
  const path = provider === "anthropic" ? "/v1/messages" : "/v1/responses";
  const all = await fakeRequests(marker, path);
  return all.filter((r) => r.body.stream === true).sort((a, b) => a.at - b.at);
}

/** Das Datum steht in der Nutzer-Nachricht (nicht im System-Prompt), damit der Cache-Präfix stabil bleibt. */
const withDate = (text: string) => expect.stringMatching(new RegExp(`^\\[Kontext: Heute ist \\p{L}+, \\d{1,2}\\. \\p{L}+ \\d{4}\\.\\]\\n\\n${text}$`, "u"));

/** Die Werkzeuge der Verbindung „Posteingang“ stehen immer bereit (fester Präfix fürs Prompt Caching). */
const MAILBOX_TOOLS = ["mailbox_list", "mailbox_read", "mailbox_send"];

const TRUNCATED = "(Die Antwort wurde wegen der Längenbegrenzung abgeschnitten.)";
const REFUSED = "Das Modell hat diese Anfrage aus Sicherheitsgründen abgelehnt.";

for (const m of MODELS) {
  test.describe(`V · ${m.name}`, () => {
    test.beforeEach(async ({ chat, page }) => {
      await chooseModel(page, m.name);
      void chat;
    });

    test(`V01 ${m.name}: Text, Gedankengang und Anfrage im erwarteten Format`, async ({ chat }) => {
      const id = uniq();
      const answer = await chat.ask(`Hallo Fake ${id}`);
      await expect(answer).toContainText(`Fake-Antwort von ${m.modelId}.`);
      await answer.getByRole("button", { name: "Gedankengang" }).click();
      await expect(answer).toContainText("Ich denke kurz nach (Fake-Gedankengang).");
      await expect(answer).toContainText(m.name);

      const [request, ...more] = await chatRequests(id, m.provider);
      expect(more).toHaveLength(0);
      const body = request.body;
      expect(body.model).toBe(m.modelId);
      if (m.provider === "anthropic") {
        expect(body.system[0]).toMatchObject({ type: "text", cache_control: { type: "ephemeral" } });
        expect(body.cache_control).toEqual({ type: "ephemeral" });
        expect(body.thinking).toMatchObject({ type: "adaptive", display: "summarized" });
        expect(body.output_config).toEqual({ effort: "medium" });
        expect(body.max_tokens).toBe(32000);
        expect(body.fallbacks).toBe("default");
        expect(request.headers["anthropic-beta"]).toContain("thinking-binding-controls-2026-08-01");
        expect(request.headers["anthropic-beta"]).toContain("server-side-fallback-2026-07-01");
        expect(body.tools.map((t: { name: string }) => t.name)).toEqual(["generate_image", ...MAILBOX_TOOLS, "web_fetch", "web_search"]);
        expect(body.messages).toEqual([{ role: "user", content: [{ type: "text", text: withDate(`Hallo Fake ${id}`) }] }]);
      } else {
        expect(typeof body.instructions).toBe("string");
        expect(body.store).toBe(false);
        expect(body.prompt_cache_key).toMatch(/\S{8,}/);
        expect(body.reasoning).toEqual({ effort: "medium", summary: "auto" });
        expect(body.include).toEqual(["reasoning.encrypted_content"]);
        expect(body.max_output_tokens).toBe(32000);
        expect(body.tools.map((t: { type: string; name?: string }) => t.name ?? t.type)).toEqual(["generate_image", ...MAILBOX_TOOLS, "web_search"]);
        expect(body.input).toEqual([{ role: "user", content: [{ type: "input_text", text: withDate(`Hallo Fake ${id}`) }] }]);
      }
    });

    test(`V02 ${m.name}: Websuche zeigt Quellen und lässt sich abschalten`, async ({ chat, page }) => {
      const id = uniq();
      const answer = await chat.ask(`#fake:websuche ${id}`);
      const links = answer.getByRole("navigation", { name: "Quellen" }).getByRole("link");
      const expected = m.provider === "anthropic" ? ["Quelle eins", "Quelle zwei", "Quelle drei"] : ["Quelle eins", "Quelle zwei"];
      await expect(links).toHaveCount(expected.length);
      for (const [i, title] of expected.entries()) await expect(links.nth(i)).toContainText(title);

      await page.getByRole("button", { name: "Websuche" }).click();
      const off = uniq();
      await chat.ask(`Ohne Suche ${off}`);
      const [request] = await chatRequests(off, m.provider);
      if (m.provider === "anthropic") {
        // Werkzeuge bleiben gleich (Cache!), die Nachricht sagt, dass nicht gesucht werden soll.
        expect(request.body.tools.map((t: { name: string }) => t.name)).toContain("web_search");
        expect(request.body.messages.at(-1).content.at(-1).text).toBe("(Für diese Nachricht ist die Websuche ausgeschaltet. Nutze keine Websuche und keinen Webabruf.)");
      } else {
        expect(request.body.input.at(-1)).toEqual({ role: "developer", content: "Für diese Nachricht ist die Websuche ausgeschaltet. Nutze keine Websuche." });
      }
    });

    test(`V03 ${m.name}: Bild-Werkzeug, Längenbegrenzung und Ablehnung`, async ({ chat }) => {
      const id = uniq();
      const answer = await chat.ask(`#fake:bild ${id}`);
      await expect(answer).toContainText("Hier ist dein Fake-Bild.");
      await expect(answer.getByRole("img")).toHaveCount(1);
      const requests = await chatRequests(id, m.provider);
      expect(requests).toHaveLength(2);
      const images = await fakeRequests(id, "/v1/images/generations");
      expect(images).toHaveLength(1);
      expect(images[0].body).toMatchObject({ model: "gpt-image-2", size: "1024x1024", quality: "low", n: 1 });
      if (m.provider === "anthropic") {
        const last = requests[1].body.messages.at(-1);
        expect(last.role).toBe("user");
        expect(last.content).toHaveLength(1);
        expect(last.content[0]).toMatchObject({ type: "tool_result", content: expect.stringMatching(/^Bild erzeugt und angezeigt \(Bild-ID: images\//) });
      } else {
        expect(requests[1].body.input.at(-1)).toMatchObject({ type: "function_call_output", output: expect.stringMatching(/^Bild erzeugt und angezeigt/) });
      }

      const long = await chat.ask(`#fake:maxtokens ${uniq()}`);
      await expect(long).toContainText(`Diese Antwort ist zu lang und endet mitten im${"\n"}`.trim());
      await expect(long).toContainText(TRUNCATED);

      const refused = await chat.ask(`#fake:ablehnung ${uniq()}`);
      await expect(refused).toContainText(REFUSED);
    });

    const errors: [number, string][] = [
      [401, "Der API-Schlüssel wurde abgelehnt. Bitte im Admin-Bereich prüfen."],
      [429, "Der Anbieter ist gerade überlastet oder das Kontingent ist erschöpft. Bitte gleich nochmal versuchen."],
      [413, "Die Anfrage ist zu groß. Bitte kürzere Dateien verwenden oder einen neuen Chat starten."],
      [400, "Die Anfrage wurde abgelehnt: Bad request from fake"],
      [500, "Der Anbieter hat gerade Probleme. Bitte gleich nochmal versuchen."],
    ];
    test(`V04 ${m.name}: Fehler des Anbieters als deutsche Meldung`, async ({ chat }) => {
      for (const [status, message] of errors) {
        const answer = await chat.ask(`#fake:fehler:${status} ${uniq()}`);
        await expect(answer.getByRole("alert")).toHaveText(message);
        await expect(answer.getByRole("button", { name: "Neu generieren" })).toBeVisible();
      }
    });

    test(`V04 ${m.name}: Abbruch mitten im Stream hängt nicht`, async ({ chat }) => {
      const answer = await chat.ask(`#fake:abbruch ${uniq()}`);
      await expect(answer.getByRole("alert")).toHaveText("Die Verbindung zum Anbieter ist abgebrochen. Bitte „Neu generieren“ verwenden.");
      await expect(answer.getByRole("button", { name: "Neu generieren" })).toBeVisible();
    });
  });
}

test.describe("V · nur Claude", () => {
  test("V03 Fortsetzung nach pause_turn und Kennzeichen „Ersatzmodell“", async ({ chat, page }) => {
    await chooseModel(page, "Claude Sonnet 5.5");
    const id = uniq();
    const answer = await chat.ask(`#fake:pause ${id}`);
    await expect(answer).toContainText("Erster Teil vor der Pause.");
    await expect(answer).toContainText("Zweiter Teil nach der Pause.");
    const requests = await chatRequests(id, "anthropic");
    expect(requests).toHaveLength(2);
    // Die Fortsetzung schickt die unterbrochene Antwort unverändert zurück.
    expect(requests[1].body.messages.slice(0, -1)).toEqual(requests[0].body.messages);
    expect(requests[1].body.messages.at(-1).role).toBe("assistant");

    const fallback = await chat.ask(`#fake:ersatzmodell ${uniq()}`);
    await expect(fallback).toContainText("Ersatzmodell: claude-ersatz-1");
    // Der fallback-Block wird nicht zurückgeschickt.
    const next = uniq();
    await chat.ask(`Weiter ${next}`);
    const [follow] = await chatRequests(next, "anthropic");
    expect(JSON.stringify(follow.body.messages)).not.toContain('"type":"fallback"');
  });

  test("V02 Claude Haiku nutzt die Basis-Werkzeuge für die Websuche", async ({ chat, page }) => {
    await chooseModel(page, "Claude Haiku 5.5");
    const id = uniq();
    const answer = await chat.ask(`#fake:websuche ${id}`);
    await expect(answer.getByRole("navigation", { name: "Quellen" }).getByRole("link")).toHaveCount(3);
    const [request] = await chatRequests(id, "anthropic");
    const types = request.body.tools.map((t: { type?: string; name: string }) => t.type ?? t.name);
    expect(types).toEqual(["generate_image", ...MAILBOX_TOOLS, "web_fetch_20250910", "web_search_20250305"]);
    expect(request.body.fallbacks).toBeUndefined();
  });
});

test.describe("V06 · Titel, Transkription, Bilder, Modell-Listen", () => {
  test("V06 Titel kommt vom Titelmodell mit niedriger Denktiefe", async ({ chat, page }) => {
    const id = uniq();
    await chat.ask(`Titel bitte ${id}`);
    await expect(page.getByRole("navigation", { name: "Chatverlauf" }).getByRole("button", { name: /^Fake-Titel/ })).toBeVisible();
    const title = (await fakeRequests(id, "/v1/messages")).find((r) => !r.body.stream);
    expect(title?.body).toMatchObject({ model: "claude-haiku-5-5", max_tokens: 2000, output_config: { effort: "low" } });
    expect(title?.body.messages[0].content).toContain(`Titel bitte ${id}`);
  });

  test("V06 Audio wird mit dem eingestellten Modell transkribiert und erreicht das Modell", async ({ chat, page }) => {
    // Ein paar zufällige Bytes am Ende: eigene Prüfsumme, also kein Treffer im Transkript-Cache.
    const audio = payload("ton.mp3");
    const unique = { ...audio, name: `ton-${uniq()}.mp3`, buffer: Buffer.concat([audio.buffer, Buffer.from(uniq())]) };
    await attach(page, unique);
    await expectReady(page, unique.name, /Tokens|Transkript/);
    const id = uniq();
    await chat.ask(`Worum geht es? ${id}`);
    const [request] = await chatRequests(id, "anthropic");
    expect(JSON.stringify(request.body.messages)).toContain("Fake-Transkript (gpt-transcribe, teil-0.mp3,");
  });

  test("V06 Bild-Modus schickt Modell, Format und Qualität an die Bild-API", async ({ chat, page }) => {
    await page.getByRole("button", { name: "Bild-Modus" }).click();
    const dialog = page.getByRole("dialog");
    const prompt = `Ein Fake-Leuchtturm ${uniq()}`;
    await dialog.getByLabel("Bildbeschreibung").fill(prompt);
    await dialog.getByLabel("Format").selectOption({ label: "Hochformat" });
    await dialog.getByLabel("Qualität").selectOption({ label: "Hoch (langsamer, teurer)" });
    await dialog.getByRole("button", { name: "Bild erzeugen" }).click();
    await expect(chat.lastAnswer.getByRole("img", { name: prompt })).toBeVisible();
    const [request] = await fakeRequests(prompt, "/v1/images/generations");
    expect(request.body).toEqual({ model: "gpt-image-2", prompt, size: "1024x1536", quality: "high", n: 1 });
  });

  test("V06/P08 Modell-Listen beider Anbieter, Übernahme in den Dialog und Verbindungstest", async ({ page }) => {
    await openAdmin(page, "Modelle");
    await page.getByRole("button", { name: "Claude-Modelle abrufen" }).click();
    await expect(page.getByRole("button", { name: "Claude Fake 2 (claude-fake-2)" })).toBeEnabled();
    // Bereits angelegte Modelle sind ausgegraut.
    await expect(page.getByRole("button", { name: "Claude Sonnet 5.5 (claude-sonnet-5-5)" })).toBeDisabled();
    await page.getByRole("button", { name: "Claude Fake 1 (claude-fake-1)" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: "Modell anlegen" })).toBeVisible();
    await expect(dialog.getByLabel("Anbieter")).toHaveValue("anthropic");
    await expect(dialog.getByLabel("API-Modell-ID")).toHaveValue("claude-fake-1");
    await expect(dialog.getByLabel("Anzeigename")).toHaveValue("Claude Fake 1");
    await dialog.getByRole("button", { name: "Abbrechen" }).click();
    await expect(dialog).toBeHidden();
    await page.getByRole("button", { name: "OpenAI-Modelle abrufen" }).click();
    await expect(page.getByRole("button", { name: /^gpt-fake-/ })).toHaveText(["gpt-fake-a", "gpt-fake-b"]);

    await page.getByRole("button", { name: "Claude Sonnet 5.5 testen" }).click();
    await expect(page.getByText("Antwort: „OK“")).toBeVisible();
    await page.getByRole("button", { name: "GPT-6.1 Sol testen" }).click();
    await expect(page.getByText("Antwort: „OK“")).toHaveCount(2);
  });
});
