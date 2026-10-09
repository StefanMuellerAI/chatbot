import type { Page } from "@playwright/test";
import { expect, test, uniq } from "../support/fixtures";

const panel = (page: Page, title: string) => page.getByRole("region", { name: `Artefakt: ${title}` });

test.describe("K · Artefakte", () => {
  test("K01 Webseite: Karte während des Streamings, Panel öffnet sich, Seite reagiert", async ({ chat, page }) => {
    await chat.send(`#langsam Baue mir eine Webseite ${uniq()}`);
    await expect(chat.lastAnswer.getByRole("button", { name: /Beispielseite.*wird erstellt/ })).toBeVisible({ timeout: 15_000 });
    await expect(panel(page, "Beispielseite")).toBeVisible();
    await expect(panel(page, "Beispielseite").getByText("Die Vorschau erscheint, sobald das Artefakt fertig ist.")).toBeVisible();
    await chat.waitForAnswer(1);
    const frame = page.frameLocator("iframe[title='Beispielseite']");
    await expect(frame.getByRole("heading", { name: "Hallo von Freebie!" })).toBeVisible();
    await frame.getByRole("button", { name: "Klick mich" }).click();
    await expect(frame.getByRole("button", { name: "Geklickt!" })).toBeVisible();
    await expect(chat.lastAnswer.getByRole("button", { name: /Beispielseite.*Klicken zum Öffnen/ })).toBeVisible();
  });

  test("K02 Sandbox: kein Zugriff auf Cookies, Speicher, API oder die Hauptseite", async ({ chat, page, context }) => {
    await chat.ask(`#artefakt-angriff ${uniq()}`);
    const result = page.frameLocator("iframe[title='Angriff']").locator("#ergebnis");
    await expect(result).toContainText("cookie=blockiert");
    await expect(result).toContainText("storage=blockiert");
    await expect(result).toContainText("parent=blockiert");
    await expect(result).toContainText("fetch=blockiert");
    await expect(page).toHaveURL(/localhost:\d+\/$/);
    expect((await context.cookies()).some((c) => c.name === "freebie_session")).toBe(true);
    await expect(chat.composer).toBeVisible();
  });

  test("K03 SVG, Markdown und Code mit Vorschau- und Code-Reiter", async ({ chat, page }) => {
    await chat.ask(`#svg ${uniq()}`);
    const svg = panel(page, "Kreis");
    await expect(svg.getByRole("tab", { name: "Vorschau" })).toHaveAttribute("aria-selected", "true");
    await expect(page.frameLocator("iframe[title='Kreis']").locator("circle")).toBeVisible();
    await svg.getByRole("tab", { name: "Code" }).click();
    await expect(svg.getByRole("tab", { name: "Code" })).toHaveAttribute("aria-selected", "true");
    await expect(svg.getByRole("tabpanel")).toContainText('<circle cx="50"');

    await chat.ask(`#markdown-artefakt ${uniq()}`);
    await expect(panel(page, "Notiz").getByRole("heading", { name: "Überschrift" })).toBeVisible();

    await chat.ask(`#code-artefakt ${uniq()}`);
    const code = panel(page, "Skript");
    await expect(code.getByRole("tab", { name: "Vorschau" })).toHaveCount(0);
    await expect(code.getByRole("tabpanel")).toContainText('print("Hallo von Freebie")');
  });

  test("K03 Mermaid-Diagramm wird gezeichnet, Fehler werden erklärt", async ({ chat, page }) => {
    await chat.ask(`Zeichne den Ablauf als Diagramm ${uniq()}`);
    const diagram = panel(page, "Ablauf");
    await expect(diagram.getByRole("tabpanel").locator("svg").first()).toBeVisible({ timeout: 15_000 });
    await expect(diagram.getByText("Freebie denkt nach")).toBeVisible();
    await chat.ask(`#mermaid-fehler ${uniq()}`);
    await expect(panel(page, "Kaputtes Diagramm").getByText(/Das Diagramm enthält einen Fehler/)).toBeVisible({ timeout: 15_000 });
  });

  test("K04 Versionen: Auswahl im Panel, Karten öffnen ihre eigene Version", async ({ chat, page }) => {
    const id = uniq();
    await chat.ask(`#version:1 ${id}`);
    await chat.ask(`#version:2 ${id}`);
    const p = panel(page, "Beispielseite");
    const select = p.getByRole("combobox", { name: "Version wählen" });
    await expect(select).toHaveValue("2");
    await expect(page.frameLocator("iframe[title='Beispielseite']").getByRole("heading")).toHaveText("Version 2");
    await select.selectOption("1");
    await expect(page.frameLocator("iframe[title='Beispielseite']").getByRole("heading")).toHaveText("Version 1");

    await p.getByRole("button", { name: "Panel schließen" }).click();
    await expect(p).toBeHidden();
    await chat.answers.first().getByRole("button", { name: /Beispielseite/ }).click();
    await expect(select).toHaveValue("1");
    await chat.answers.last().getByRole("button", { name: /Beispielseite/ }).click();
    await expect(select).toHaveValue("2");
  });

  test("K05 Kopieren, Herunterladen, neuer Tab, Schließen und Kopfzeilen-Knopf", async ({ chat, page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await chat.ask(`Baue eine Landingpage ${uniq()}`);
    const p = panel(page, "Beispielseite");

    await p.getByRole("button", { name: "Quelltext kopieren" }).click();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toMatch(/^<!doctype html>/);
    expect(copied).toContain("Hallo von Freebie!");

    const download = page.waitForEvent("download");
    await p.getByRole("button", { name: "beispiel-seite.html herunterladen" }).click();
    const file = await download;
    expect(file.suggestedFilename()).toBe("beispiel-seite.html");
    expect(Buffer.concat(await (await file.createReadStream()).toArray()).toString("utf8")).toBe(copied);

    const popup = page.waitForEvent("popup");
    await p.getByRole("button", { name: "In neuem Tab öffnen" }).click();
    const tab = await popup;
    await expect(tab.frameLocator("iframe").getByRole("heading", { name: "Hallo von Freebie!" })).toBeVisible();
    expect(await tab.locator("iframe").getAttribute("sandbox")).not.toContain("allow-same-origin");
    await tab.close();

    await page.keyboard.press("Escape");
    await expect(p).toBeHidden();
    const toggle = page.getByRole("button", { name: "Artefakte (1)" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
    await expect(p).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await toggle.click();
    await expect(p).toBeHidden();
  });

  test("K05 Mermaid lässt sich als SVG herunterladen", async ({ chat, page }) => {
    await chat.ask(`Erstelle ein Diagramm vom Ablauf ${uniq()}`);
    const p = panel(page, "Ablauf");
    await expect(p.getByRole("tabpanel").locator("svg").first()).toBeVisible({ timeout: 15_000 });
    const download = page.waitForEvent("download");
    await p.getByRole("button", { name: "Diagramm als SVG herunterladen" }).click();
    const file = await download;
    expect(file.suggestedFilename()).toBe("ablauf.svg");
    expect(Buffer.concat(await (await file.createReadStream()).toArray()).toString("utf8")).toMatch(/^<svg/);
  });

  test("K06 auf dem Handy füllt das Panel den Bildschirm @mobil", async ({ chat, page }) => {
    await chat.ask(`Baue mir eine Webseite ${uniq()}`);
    const p = panel(page, "Beispielseite");
    const box = await p.boundingBox();
    const viewport = page.viewportSize()!;
    expect(Math.round(box!.width)).toBe(viewport.width);
    await p.getByRole("button", { name: "Panel schließen" }).click();
    await expect(p).toBeHidden();
    await expect(chat.composer).toBeVisible();
  });
});
