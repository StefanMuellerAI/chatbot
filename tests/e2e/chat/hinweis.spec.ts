import { ChatPage, expect, loginUser, test } from "../support/fixtures";

test.describe("B · Hinweis „Spielumgebung“", () => {
  test("B01 beim ersten Besuch nur mit „Verstanden“ schließbar, danach nicht mehr", async ({ page }) => {
    await loginUser(page, { acknowledgeNotice: false });
    await page.goto("/");
    const dialog = page.getByRole("dialog", { name: "Wichtiger Hinweis" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("Spiel- und Übungsumgebung");
    await expect(dialog.getByRole("button", { name: "Schließen" })).toHaveCount(0);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(dialog).toBeVisible();

    await dialog.getByRole("button", { name: "Verstanden" }).click();
    await expect(dialog).toBeHidden();
    await page.reload();
    await expect(page.getByRole("textbox", { name: "Nachricht" })).toBeVisible();
    await expect(page.getByRole("dialog", { name: "Wichtiger Hinweis" })).toBeHidden();
  });

  test("B03 Kurzhinweis in der Fußzeile, „Mehr“ öffnet den Hinweis zum Schließen per X, Esc und Klick daneben", async ({ chat, page }) => {
    await expect(page.getByText("Spielumgebung – bitte keine vertraulichen oder personenbezogenen Daten eingeben.")).toBeVisible();
    const dialog = page.getByRole("dialog", { name: "Wichtiger Hinweis" });
    const more = page.getByRole("button", { name: "Mehr" });

    await more.click();
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Schließen" }).click();
    await expect(dialog).toBeHidden();

    await more.click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();

    await more.click();
    await expect(dialog).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(dialog).toBeHidden();
    expect(chat).toBeInstanceOf(ChatPage);
  });
});
