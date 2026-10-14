import type { Locator, Page } from "@playwright/test";
import { expect, test, uniq, type ChatPage } from "../support/fixtures";
import { CLIPBOARD, dropOn, expectConsistent, pasteInto, pasteText, trackMicrophone } from "../support/grenzfaelle";
import { MailPage } from "../support/mail";

// W07: Zufällige Folgen von Teilnehmer-Aktionen mit festen Seeds (GRENZFAELLE-PLAN.md, Abschnitt 5.3). Nach jedem
// Schritt gelten die Invarianten aus expectConsistent, am Ende öffnet sich jeder Chat auch nach dem Neuladen.
// Ein Fehler nennt Seed, Schritt und Aktionsliste – nachspielen mit
//   ZUFALL_SEED=<seed> npx playwright test --project=zufall
// In der CI laufen 5 feste Seeds mit je 40 Schritten, nachts 50 neue (ZUFALL_START, ZUFALL_ANZAHL, ZUFALL_SCHRITTE).

const STEPS = Number(process.env.ZUFALL_SCHRITTE ?? 40);
const SEEDS = process.env.ZUFALL_SEED
  ? [Number(process.env.ZUFALL_SEED)]
  : process.env.ZUFALL_START
    ? Array.from({ length: Number(process.env.ZUFALL_ANZAHL ?? 50) }, (_, i) => Number(process.env.ZUFALL_START) + i)
    : [7, 23, 42, 101, 2026];

/** Kleiner, reproduzierbarer Zufallsgenerator (mulberry32). */
function generator(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Ctx {
  chat: ChatPage;
  page: Page;
  pick: <T>(list: readonly T[]) => T;
  /** Eindeutiger Text für diesen Schritt (Antwort-Cache, Wiedererkennen im Verlauf). */
  tag: () => string;
}

interface Action {
  name: string;
  weight: number;
  when: (c: Ctx) => Promise<boolean>;
  run: (c: Ctx) => Promise<void>;
}

const TEXTS = [
  "Was ist ein Verwaltungsakt?",
  "#langsam Erkläre bitte ausführlich die Gewaltenteilung.",
  "#fehler:500 Das geht schief.",
  "#warten:2 Kurz nachdenken, dann antworten.",
  "Zeile eins\nZeile zwei\n\nAbsatz",
  "Mit Steuer\u0001zeichen und Null\u0000byte 😀 مرحبا",
  "   ",
  "Lang ".repeat(800),
];
const FILES = ["notiz.txt", "notiz.txt", "tabelle.csv", "alt.doc", "ohneendung"];
const EXAMPLE = "Baue mir eine kleine Landingpage für ein Café in Leipzig.";

const usable = async (l: Locator) => (await l.isVisible()) && (await l.isEnabled());
const nav = (page: Page) => page.getByRole("navigation", { name: "Chatverlauf" });
// Klicks auf Elemente, die gerade verschwinden (Antwort fertig, Liste neu sortiert), gelten als übersprungen.
const QUICK = { timeout: 3_000 };

const ACTIONS: Action[] = [
  {
    name: "tippen",
    weight: 4,
    when: ({ chat }) => usable(chat.composer),
    run: ({ chat, pick, tag }) => chat.composer.fill(`${pick(TEXTS)} ${tag()}`),
  },
  {
    name: "einfügen",
    weight: 2,
    when: ({ chat }) => usable(chat.composer),
    run: async ({ chat, pick, tag }) => {
      if (pick([true, false])) await pasteInto(chat.composer, pick(Object.keys(CLIPBOARD) as (keyof typeof CLIPBOARD)[]));
      else await pasteText(chat.composer, `Eingefügt ${tag()}`);
    },
  },
  { name: "senden", weight: 4, when: ({ chat }) => usable(chat.sendButton), run: ({ chat }) => chat.sendButton.click(QUICK) },
  { name: "doppelt senden", weight: 1, when: ({ chat }) => usable(chat.sendButton), run: ({ chat }) => chat.sendButton.dblclick(QUICK) },
  { name: "Enter", weight: 1, when: ({ chat }) => usable(chat.sendButton), run: ({ chat }) => chat.composer.press("Enter") },
  { name: "stoppen", weight: 2, when: ({ chat }) => chat.stopButton.isVisible(), run: ({ chat }) => chat.stopButton.click(QUICK) },
  { name: "auf die Antwort warten", weight: 3, when: ({ chat }) => chat.stopButton.isVisible(), run: ({ chat }) => chat.waitForAnswer() },
  {
    name: "neu generieren",
    weight: 1,
    when: async ({ chat }) => !(await chat.stopButton.isVisible()) && (await chat.answers.count()) > 0,
    run: async ({ chat }) => {
      await chat.lastAnswer.hover(QUICK);
      await chat.lastAnswer.getByRole("button", { name: "Neu generieren" }).click(QUICK);
    },
  },
  {
    name: "bearbeiten",
    weight: 1,
    when: async ({ chat }) => !(await chat.stopButton.isVisible()) && (await chat.questions.count()) > 0,
    run: async ({ chat, pick }) => {
      const n = await chat.questions.count();
      const question = chat.questions.nth(pick([...Array(n).keys()]));
      await question.hover(QUICK);
      await question.getByRole("button", { name: "Bearbeiten" }).click(QUICK);
    },
  },
  {
    name: "Bearbeiten abbrechen",
    weight: 1,
    when: ({ page }) => page.getByText("Du bearbeitest eine frühere Nachricht.").isVisible(),
    run: ({ page }) => page.getByRole("button", { name: "Abbrechen", exact: true }).click(QUICK),
  },
  { name: "Beispiel", weight: 1, when: ({ page }) => usable(page.getByRole("button", { name: EXAMPLE })), run: ({ page }) => page.getByRole("button", { name: EXAMPLE }).click(QUICK) },
  {
    name: "Datei anhängen",
    weight: 2,
    when: ({ chat }) => usable(chat.composer),
    run: ({ page, pick, tag }) => page.getByLabel("Dateien zum Anhängen").setInputFiles([{ name: pick(FILES), mimeType: "text/plain", buffer: Buffer.from(`Inhalt ${tag()}`) }]),
  },
  {
    name: "Anhang entfernen",
    weight: 1,
    when: async ({ page }) => (await page.getByRole("group", { name: "Anhänge" }).getByRole("button", { name: / entfernen$/ }).count()) > 0,
    run: async ({ page, pick }) => {
      const buttons = page.getByRole("group", { name: "Anhänge" }).getByRole("button", { name: / entfernen$/ });
      await buttons.nth(pick([...Array(await buttons.count()).keys()])).click(QUICK);
    },
  },
  {
    name: "Datei neben die Ablage",
    weight: 1,
    when: async () => true,
    run: async ({ page, tag }) => void (await dropOn(page.locator("aside"), { files: [{ name: "daneben.txt", text: `Daneben ${tag()}` }] })),
  },
  {
    name: "anderen Chat wählen",
    weight: 2,
    when: async ({ page }) => (await nav(page).locator("button:not([aria-label]):enabled").count()) > 0,
    run: async ({ page, pick }) => {
      const chats = nav(page).locator("button:not([aria-label]):enabled");
      await chats.nth(pick([...Array(await chats.count()).keys()])).click(QUICK);
    },
  },
  {
    name: "neuer Chat",
    weight: 1,
    when: ({ page }) => usable(page.getByRole("button", { name: "Neuer Chat" }).first()),
    run: ({ chat }) => chat.newChat(),
  },
  {
    name: "Chat löschen",
    weight: 1,
    when: async ({ page }) => (await nav(page).getByRole("button", { name: /^Chat „.*“ löschen$/ }).count()) > 0,
    run: async ({ page, pick }) => {
      const buttons = nav(page).getByRole("button", { name: /^Chat „.*“ löschen$/ });
      await buttons.nth(pick([...Array(await buttons.count()).keys()])).click(QUICK);
    },
  },
  { name: "Websuche umschalten", weight: 1, when: ({ page }) => usable(page.getByRole("button", { name: "Websuche" })), run: ({ page }) => page.getByRole("button", { name: "Websuche" }).click(QUICK) },
  {
    name: "Posteingang und zurück",
    weight: 1,
    when: ({ chat }) => MailPage.of(chat).postTab.isVisible(),
    run: async ({ chat }) => {
      const mail = MailPage.of(chat);
      await mail.open();
      await mail.chatTab.click();
      await expect(chat.composer).toBeVisible();
    },
  },
  {
    name: "neu laden",
    weight: 1,
    when: async () => true,
    run: async ({ chat, page }) => {
      await page.reload();
      await expect(chat.composer).toBeVisible();
    },
  },
  {
    name: "Diktat",
    weight: 1,
    when: ({ page }) => usable(page.getByRole("button", { name: "Spracheingabe" })),
    run: async ({ page }) => {
      await page.getByRole("button", { name: "Spracheingabe" }).click(QUICK);
      const stop = page.getByRole("button", { name: "Aufnahme beenden" });
      await expect(stop).toContainText(/0:0[1-9]/, { timeout: 10_000 });
      await stop.click();
      await expect(page.getByRole("button", { name: "Spracheingabe" })).toBeVisible({ timeout: 20_000 });
    },
  },
];

for (const seed of SEEDS) {
  test(`W07 Zufallstest Seed ${seed}: ${STEPS} Bedienschritte ohne verletzte Invariante`, async ({ chat, page }) => {
    test.setTimeout(STEPS * 8_000 + 60_000);
    await trackMicrophone(page);
    await page.reload();
    page.on("dialog", (d) => void d.accept());
    const random = generator(seed);
    const id = uniq();
    let n = 0;
    const ctx: Ctx = { chat, page, pick: (list) => list[Math.floor(random() * list.length)], tag: () => `${id}-${++n}` };
    const done: string[] = [];
    const fail = (step: number, err: unknown): never => {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(
        `W07 Seed ${seed}, Schritt ${step}/${STEPS} – nachspielen: ZUFALL_SEED=${seed} npx playwright test --project=zufall\nAktionen: ${done.join(" → ")}\n\n${message}`,
      );
    };

    for (let step = 1; step <= STEPS; step++) {
      const candidates: Action[] = [];
      for (const action of ACTIONS) if (await action.when(ctx)) for (let w = 0; w < action.weight; w++) candidates.push(action);
      const action = ctx.pick(candidates);
      const chatsBefore = await nav(page).locator("button:not([aria-label])").count();
      try {
        await action.run(ctx);
        done.push(action.name);
      } catch (err) {
        // Das Element war im entscheidenden Augenblick weg (Antwort fertig, Liste neu sortiert) – kein Fehler.
        if (err instanceof Error && /Timeout \d+ms exceeded/.test(err.message) && /locator\.(click|dblclick|hover)/.test(err.message)) {
          done.push(`${action.name} (übersprungen)`);
        } else fail(step, err);
      }
      try {
        await page.waitForTimeout(150);
        if (await chat.composer.isVisible()) await expectConsistent(chat);
        // Ein Schritt legt höchstens einen Chat an (kein Doppel-Senden, kein doppelter Import).
        expect(await nav(page).locator("button:not([aria-label])").count(), "höchstens ein neuer Chat pro Schritt").toBeLessThanOrEqual(chatsBefore + 1);
      } catch (err) {
        fail(step, err);
      }
    }

    // Am Ende: laufende Antwort abwarten, neu laden – jeder Chat lässt sich öffnen und ist in Ordnung.
    try {
      if (await chat.stopButton.isVisible()) await chat.waitForAnswer();
      await page.reload();
      await expect(chat.composer).toBeVisible();
      const chats = nav(page).locator("button:not([aria-label])");
      for (let i = 0; i < (await chats.count()); i++) {
        await chats.nth(i).click();
        await expect(page.getByText("Dieser Chat kann nicht angezeigt werden")).toHaveCount(0);
        await expectConsistent(chat);
      }
    } catch (err) {
      fail(STEPS, err);
    }
  });
}
