import { expect, loginUser, test, uniq } from "../support/fixtures";
import { expectAccessible } from "../support/a11y";

test.describe("N · Darstellung, Handy und Barrierefreiheit", () => {
  test("N01 Handy: Menü öffnet und schließt, Chatwahl schließt die Leiste, Aktionen ohne Hover @mobil", async ({ chat, page }) => {
    const id = uniq();
    await chat.ask(`Handy eins ${id}`);
    const nav = page.getByRole("navigation", { name: "Chatverlauf" });
    await expect(nav).not.toBeInViewport();
    // Aktionen sind auf dem Handy ohne Hover sichtbar.
    await expect(chat.lastAnswer.getByRole("button", { name: "Antwort kopieren" })).toBeVisible();
    expect(await chat.questions.last().getByRole("button", { name: "Bearbeiten" }).evaluate((el) => getComputedStyle(el.parentElement!).opacity)).toBe("1");

    await page.getByRole("button", { name: "Menü öffnen" }).click();
    await expect(nav).toBeInViewport();
    await page.getByRole("button", { name: "Menü schließen" }).click();
    await expect(nav).not.toBeInViewport();

    await page.getByRole("button", { name: "Menü öffnen" }).click();
    const viewport = page.viewportSize()!;
    await page.mouse.click(viewport.width - 10, viewport.height / 2);
    await expect(nav).not.toBeInViewport();

    await page.getByRole("button", { name: "Neuer Chat" }).last().click();
    await expect(page.getByRole("heading", { name: "Hallo, ich bin Freebie." })).toBeVisible();
    await page.getByRole("button", { name: "Menü öffnen" }).click();
    await nav.getByRole("button", { name: `Handy eins ${id}`, exact: true }).click();
    await expect(nav).not.toBeInViewport();
    await expect(chat.questions).toHaveCount(1);
    await expect(chat.composer).toBeInViewport();
  });

  test("N01 Tablet: Seitenleiste dauerhaft sichtbar, alles erreichbar @tablet", async ({ chat, page }) => {
    await expect(page.getByRole("navigation", { name: "Chatverlauf" })).toBeInViewport();
    await chat.ask(`Tablet ${uniq()}`);
    await expect(chat.composer).toBeInViewport();
  });

  test("N03 Login-Seite ist barrierearm", async ({ page }, testInfo) => {
    await page.goto("/login");
    await expectAccessible(page, testInfo, "login");
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`N03 Chat ist barrierearm (${scheme === "light" ? "hell" : "dunkel"})`, async ({ page }, testInfo) => {
      await page.emulateMedia({ colorScheme: scheme });
      await loginUser(page, { acknowledgeNotice: false });
      await page.goto("/");
      const notice = page.getByRole("dialog", { name: "Wichtiger Hinweis" });
      await expect(notice).toBeVisible();
      await expectAccessible(page, testInfo, `hinweis-${scheme}`);
      await notice.getByRole("button", { name: "Verstanden" }).click();
      await expectAccessible(page, testInfo, `start-${scheme}`);

      const composer = page.getByRole("textbox", { name: "Nachricht" });
      await composer.fill(`#formatierung Barrierefreiheit ${uniq()}`);
      await page.getByRole("button", { name: "Senden", exact: true }).click();
      await expect(page.getByRole("article", { name: "Antwort von Freebie" })).toHaveAttribute("aria-busy", "false", { timeout: 20_000 });
      await composer.fill(`Baue mir eine Webseite ${uniq()}`);
      await page.getByRole("button", { name: "Senden", exact: true }).click();
      await expect(page.getByRole("region", { name: "Artefakt: Beispielseite" })).toBeVisible({ timeout: 20_000 });
      await expect(page.getByRole("article", { name: "Antwort von Freebie" }).last()).toHaveAttribute("aria-busy", "false", { timeout: 20_000 });
      await expectAccessible(page, testInfo, `chat-${scheme}`);

      await page.getByRole("button", { name: "Bild-Modus" }).click();
      await expect(page.getByRole("dialog", { name: "Bild-Modus" })).toBeVisible();
      await expectAccessible(page, testInfo, `bildmodus-${scheme}`);
      await page.keyboard.press("Escape");

      await page.getByRole("button", { name: /^Modell:/ }).click();
      await expectAccessible(page, testInfo, `modellwahl-${scheme}`);
    });
  }

  test("N04 Dialoge halten den Fokus und geben ihn zurück", async ({ chat, page }) => {
    const more = page.getByRole("button", { name: "Mehr" });
    await more.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Wichtiger Hinweis" });
    await expect(dialog).toBeVisible();
    // Der Fokus erreicht nie Elemente hinter dem Dialog (höchstens die Browserleiste).
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press("Tab");
      expect(await dialog.evaluate((d) => d.contains(document.activeElement) || document.activeElement === document.body)).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(more).toBeFocused();
    void chat;
  });
});
