import type { Page } from "@playwright/test";
import { expect, test, uniq } from "../support/fixtures";

const presetButton = (page: Page, name: string) => page.getByRole("button", { name: new RegExp(`^${name}`) });
const cacheBadge = "aus dem Cache";

test.describe("L · Vorlagen im Chat", () => {
  test("L01 Vorlage wählen und abwählen, Rolle geht an das Modell und bleibt beim Chat", async ({ chat, page }) => {
    await expect(page.getByText("Mit einer Vorlage starten")).toBeVisible();
    const names = ["E-Mail-Profi", "Excel-Erklärer", "Präsentations-Coach", "Webseiten-Baukasten", "Ideen-Sparring"];
    for (const name of names) await expect(presetButton(page, name)).toBeVisible();

    const email = presetButton(page, "E-Mail-Profi");
    await email.click();
    await expect(email).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("header").getByText("E-Mail-Profi")).toBeVisible();
    await email.click();
    await expect(email).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("header").getByText("E-Mail-Profi")).toBeHidden();

    await email.click();
    const id = uniq();
    const answer = await chat.ask(`Schreib eine Absage ${id}`);
    expect(await chat.diagnosis(answer, "Vorlage")).toMatch(/^Rolle: Du bist ein erfahrener Kommunikationsprofi/);

    await chat.newChat();
    await expect(page.locator("header").getByText("E-Mail-Profi")).toBeHidden();
    const plain = await chat.ask(`Ohne Vorlage ${id}`);
    expect(await chat.diagnosis(plain, "Vorlage")).toBe("keine");

    await page.getByRole("navigation", { name: "Chatverlauf" }).getByRole("button", { name: `Schreib eine Absage ${id}`, exact: true }).click();
    await expect(page.locator("header").getByText("E-Mail-Profi")).toBeVisible();
    const again = await chat.ask(`Noch eine ${id}`);
    expect(await chat.diagnosis(again, "Vorlage")).toMatch(/^Rolle: Du bist ein erfahrener Kommunikationsprofi/);
  });
});

test.describe("M · Antwort-Cache", () => {
  test("M01 gleiche erste Frage in neuem Chat kommt aus dem Cache", async ({ chat }) => {
    const question = `Was ist Prompt Caching? ${uniq()}`;
    const first = await chat.ask(question);
    await expect(first.getByText(cacheBadge)).toHaveCount(0);
    await chat.newChat();
    const second = await chat.ask(question);
    await expect(second.getByText(cacheBadge)).toBeVisible();
    await expect(second.getByText(cacheBadge)).toHaveAttribute("title", "Diese Antwort kam aus dem gemeinsamen Antwort-Cache und hat nichts gekostet.");
    expect(await second.innerText()).toContain("Testmodus");
  });

  test("M02 anderes Modell, andere Denktiefe, Websuche aus oder Vorlage: kein Treffer", async ({ chat, page }) => {
    const question = `Cache-Schlüssel ${uniq()}`;
    await chat.ask(question);
    const variants: [string, () => Promise<void>][] = [
      ["Modell", async () => {
        await page.getByRole("button", { name: /^Modell:/ }).click();
        await page.getByRole("option", { name: /^Claude Opus 5\.5/ }).click();
      }],
      ["Denktiefe", async () => {
        await page.getByRole("button", { name: /^Denktiefe:/ }).click();
        await page.getByRole("menuitemradio", { name: /^Hoch/ }).click();
      }],
      ["Websuche", () => page.getByRole("button", { name: "Websuche" }).click()],
      ["Vorlage", () => presetButton(page, "Ideen-Sparring").click()],
    ];
    for (const [label, change] of variants) {
      await chat.newChat();
      await change();
      const answer = await chat.ask(question);
      await expect(answer.getByText(cacheBadge), `Variante ${label}`).toHaveCount(0);
      // Zurück auf die Ausgangslage für die nächste Variante.
      await page.reload();
      await page.evaluate(() => localStorage.removeItem("freebie-last-model"));
      await page.reload();
    }
  });

  test("M02 an einem anderen Tag gilt der Cache-Eintrag nicht mehr", async ({ chat, page }) => {
    const question = `Datumsabhängig ${uniq()}`;
    await chat.ask(question);
    await page.clock.setFixedTime(new Date(Date.now() + 2 * 86_400_000));
    await page.reload();
    await chat.newChat();
    const answer = await chat.ask(question);
    await expect(answer.getByText(cacheBadge)).toHaveCount(0);
  });

  test("M03 Bilder, abgebrochene und fehlerhafte Antworten werden nicht gespeichert", async ({ chat }) => {
    const id = uniq();
    for (const question of [`Erstelle ein Bild von einer Katze ${id}`, `#fehler:500 ${id}`]) {
      await chat.ask(question);
      await chat.newChat();
      const again = await chat.ask(question);
      await expect(again.getByText(cacheBadge)).toHaveCount(0);
      await chat.newChat();
    }
    const slow = `#langsam Abbruch ${id}`;
    await chat.send(slow);
    await expect(chat.lastAnswer).toContainText("Testmodus", { timeout: 10_000 });
    await chat.stopButton.click();
    await chat.waitForAnswer(1);
    await chat.newChat();
    await chat.send(slow);
    await expect(chat.lastAnswer).toContainText("Testmodus", { timeout: 10_000 });
    await expect(chat.lastAnswer.getByText(cacheBadge)).toHaveCount(0);
    await chat.stopButton.click();
  });
});
