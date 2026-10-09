import AxeBuilder from "@axe-core/playwright";
import type { Page, TestInfo } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Prüft die Seite mit axe (keine „serious“/„critical“-Befunde) und legt einen Screenshot für die
 * Sichtprüfung in den Bericht. Inhalte von Artefakten (iframes) stammen vom Modell und bleiben außen vor.
 */
export async function expectAccessible(page: Page, testInfo: TestInfo, label: string) {
  const result = await new AxeBuilder({ page }).exclude("iframe").withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  const serious = result.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  await testInfo.attach(`axe-${label}.json`, { body: JSON.stringify(result.violations, null, 2), contentType: "application/json" });
  await testInfo.attach(`screenshot-${label}.png`, { body: await page.screenshot({ fullPage: true }), contentType: "image/png" });
  expect(
    serious.map((v) => `${v.id}: ${v.help} → ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`),
    `axe ${label}`,
  ).toEqual([]);
}
