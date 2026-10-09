import type { Page } from "@playwright/test";
import { expect, test, uniq } from "../support/fixtures";

const picker = (page: Page) => page.getByRole("button", { name: /^Modell:/ });
const effortButton = (page: Page) => page.getByRole("button", { name: /^Denktiefe:/ });

async function chooseModel(page: Page, name: string) {
  await picker(page).click();
  await page.getByRole("listbox", { name: "Modell wählen" }).getByRole("option", { name: new RegExp(`^${name}`) }).click();
  await expect(picker(page)).toHaveAccessibleName(`Modell: ${name}`);
}

async function chooseEffort(page: Page, label: string) {
  await effortButton(page).click();
  await page.getByRole("menuitemradio", { name: new RegExp(`^${label}`) }).click();
  await expect(effortButton(page)).toHaveAccessibleName(`Denktiefe: ${label}`);
}

test.describe("D · Modelle und Denktiefe", () => {
  test("D01 Auswahl zeigt alle aktiven Modelle gruppiert und sortiert mit Standard-Kennzeichen", async ({ chat, page }) => {
    await picker(page).click();
    const list = page.getByRole("listbox", { name: "Modell wählen" });
    await expect(list).toBeVisible();
    await expect(list.getByText("Anthropic", { exact: true })).toBeVisible();
    await expect(list.getByText("OpenAI", { exact: true })).toBeVisible();
    await expect(list.getByRole("option")).toHaveText([/^Claude Sonnet 5\.5/, /^Claude Opus 5\.5/, /^Claude Haiku 5\.5/, /^GPT-6\.1 Sol/, /^GPT-6 Astra/, /^GPT-6 Luna/]);
    await expect(list.getByRole("option", { name: /Claude Sonnet 5\.5/ })).toContainText("Standard");
    await expect(list.getByRole("option", { name: /Claude Sonnet 5\.5/ })).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Escape");
    await expect(list).toBeHidden();
    await expect(picker(page)).toBeFocused();
    void chat;
  });

  test("D02 Standard ist Claude Sonnet 5.5 auf „Mittel“, danach gilt das zuletzt gewählte Modell", async ({ chat, page }) => {
    await expect(picker(page)).toHaveAccessibleName("Modell: Claude Sonnet 5.5");
    await expect(effortButton(page)).toHaveAccessibleName("Denktiefe: Mittel");
    await chooseModel(page, "GPT-6 Luna");
    await page.reload();
    await expect(picker(page)).toHaveAccessibleName("Modell: GPT-6 Luna");
    const answer = await chat.ask(`Wer antwortet? ${uniq()}`);
    expect(await chat.diagnosis(answer, "Modell")).toBe("gpt-6-luna");
  });

  test("D03 Modellwechsel mitten im Chat: Hinweis, neues Modell antwortet, Wahl bleibt beim Chat", async ({ chat, page }) => {
    const id = uniq();
    const first = await chat.ask(`Vorher ${id}`);
    expect(await chat.diagnosis(first, "Modell")).toBe("claude-sonnet-5-5");
    await chooseModel(page, "Claude Opus 5.5");
    await expect(page.getByRole("status").filter({ hasText: "Modell gewechselt – für dieses Gespräch startet der Cache neu." })).toBeVisible();
    const second = await chat.ask(`Nachher ${id}`);
    expect(await chat.diagnosis(second, "Modell")).toBe("claude-opus-5-5");
    await expect(second).toContainText("Claude Opus 5.5");

    await chat.newChat();
    await chooseModel(page, "GPT-6 Astra");
    await page.getByRole("navigation", { name: "Chatverlauf" }).getByRole("button", { name: `Vorher ${id}`, exact: true }).click();
    await expect(picker(page)).toHaveAccessibleName("Modell: Claude Opus 5.5");
  });

  test("D04 Denktiefe gilt für die nächste Nachricht und bleibt beim Chat", async ({ chat, page }) => {
    const id = uniq();
    await effortButton(page).click();
    const items = page.getByRole("menuitemradio");
    await expect(items).toHaveText([/^Niedrig/, /^Mittel/, /^Hoch/, /^Maximal/]);
    await expect(page.getByRole("menuitemradio", { name: /^Mittel/ })).toHaveAttribute("aria-checked", "true");
    await page.keyboard.press("Escape");

    await chooseEffort(page, "Hoch");
    const answer = await chat.ask(`Gründlich ${id}`);
    expect(await chat.diagnosis(answer, "Effort")).toBe("high");

    await chat.newChat();
    await expect(effortButton(page)).toHaveAccessibleName("Denktiefe: Mittel");
    await page.getByRole("navigation", { name: "Chatverlauf" }).getByRole("button", { name: `Gründlich ${id}`, exact: true }).click();
    await expect(effortButton(page)).toHaveAccessibleName("Denktiefe: Hoch");
  });

  test("D07 unbekanntes gespeichertes Modell fällt auf den Standard zurück", async ({ chat, page }) => {
    await page.evaluate(() => localStorage.setItem("freebie-last-model", "gibt-es-nicht"));
    await page.reload();
    await expect(picker(page)).toHaveAccessibleName("Modell: Claude Sonnet 5.5");
    void chat;
  });

  test("D08 ohne verfügbare Modelle: Hinweisleiste und gesperrte Eingabe", async ({ chat, page }) => {
    await page.route("**/api/config", async (route) => {
      const response = await route.fetch();
      const body = await response.json();
      await route.fulfill({ response, json: { ...body, models: [], defaultModelId: null } });
    });
    await page.reload();
    await expect(page.getByText("Es sind noch keine Modelle verfügbar. Bitte im Admin-Bereich die API-Schlüssel prüfen.")).toBeVisible();
    const input = page.getByRole("textbox", { name: "Nachricht", exact: true });
    await expect(input).toBeDisabled();
    await expect(input).toHaveAttribute("placeholder", "Gerade ist kein Modell verfügbar.");
    await expect(page.getByRole("button", { name: "Senden" })).toBeDisabled();
    void chat;
  });

  test("D09 Modell und Denktiefe lassen sich nur mit der Tastatur wählen", async ({ chat, page }) => {
    await picker(page).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("option", { name: /^Claude Sonnet 5\.5/ })).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("option", { name: /^Claude Opus 5\.5/ })).toBeFocused();
    await page.keyboard.press("End");
    await expect(page.getByRole("option", { name: /^GPT-6 Luna/ })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(picker(page)).toHaveAccessibleName("Modell: GPT-6 Luna");
    await expect(picker(page)).toBeFocused();

    await effortButton(page).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("menuitemradio", { name: /^Mittel/ })).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("Enter");
    await expect(effortButton(page)).toHaveAccessibleName("Denktiefe: Niedrig");
    void chat;
  });

  test("D10 während einer Antwort ist die Modellwahl gesperrt", async ({ chat, page }) => {
    await chat.send(`#langsam ${uniq()}`);
    await expect(picker(page)).toBeDisabled();
    await chat.stopButton.click();
    await chat.waitForAnswer(1);
    await expect(picker(page)).toBeEnabled();
  });
});
