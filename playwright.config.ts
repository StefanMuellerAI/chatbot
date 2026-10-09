import { existsSync } from "node:fs";
import { chromium, defineConfig, devices, type Project } from "@playwright/test";
import { baseUrl, FAKE_API_PORT, SERVERS } from "./tests/e2e/support/servers.mjs";

const CI = Boolean(process.env.CI);
const LIVE = process.env.LIVE === "1";

// In der Cloud-Umgebung liegt nur ein vorinstalliertes Chromium bereit.
const executablePath =
  process.env.CHROMIUM_PATH ||
  (existsSync(chromium.executablePath()) ? undefined : existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);

const chrome = {
  ...devices["Desktop Chrome"],
  viewport: { width: 1280, height: 860 },
  launchOptions: {
    executablePath,
    // Simuliertes Mikrofon für die Spracheingabe.
    args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"],
  },
};

const fakeApiReady = existsSync("tests/e2e/fake-api/server.mjs");

const projects: Project[] = [
  { name: "chat", testDir: "tests/e2e/chat", grepInvert: /@mobil|@tablet/, use: { ...chrome, baseURL: baseUrl("mock") } },
  { name: "admin", testDir: "tests/e2e/admin", workers: 1, use: { ...chrome, baseURL: baseUrl("mock-serial") } },
  { name: "api", testDir: "tests/e2e/api", use: { baseURL: baseUrl("mock") } },
  // Last und Ausfälle: einzeln, damit Zeitbudgets nicht von anderen Tests abhängen.
  { name: "belastung", testDir: "tests/e2e/belastung", workers: 1, timeout: 180_000, use: { ...chrome, baseURL: baseUrl("mock") } },
  {
    name: "mobile",
    testDir: "tests/e2e/chat",
    grep: /@mobil/,
    use: { ...chrome, baseURL: baseUrl("mock"), viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
  },
  {
    name: "tablet",
    testDir: "tests/e2e/chat",
    grep: /@tablet/,
    use: { ...chrome, baseURL: baseUrl("mock"), viewport: { width: 820, height: 1180 }, isMobile: true, hasTouch: true },
  },
];

if (fakeApiReady) {
  projects.push(
    { name: "provider", testDir: "tests/e2e/provider", use: { ...chrome, baseURL: baseUrl("fake") } },
    { name: "provider-serial", testDir: "tests/e2e/provider-serial", workers: 1, use: { ...chrome, baseURL: baseUrl("fake-serial") } },
  );
}

// Weitere Browser nur in der CI (dort installiert): Safari-Engine wegen iPads in Schulungen.
if (process.env.E2E_BROWSERS) {
  for (const browser of process.env.E2E_BROWSERS.split(",")) {
    const device = browser === "webkit" ? devices["Desktop Safari"] : devices["Desktop Firefox"];
    projects.push({
      name: `chat-${browser}`,
      testDir: "tests/e2e/chat",
      // Handy und Tablet laufen in eigenen Projekten (Chromium mit Touch); Mikrofon und Zwischenablage nur in Chromium.
      grepInvert: /@nur-chromium|@mobil|@tablet/,
      use: { ...device, viewport: { width: 1280, height: 860 }, baseURL: baseUrl("mock") },
    });
  }
}

const servers = Object.entries(SERVERS)
  .filter(([, s]) => s.mode === "mock" || fakeApiReady)
  .map(([name, s]) => ({
    command: `node tests/e2e/support/serve.mjs ${name} ${s.port} ${s.mode}`,
    url: `${baseUrl(name)}/login`,
    reuseExistingServer: !CI && process.env.E2E_REUSE === "1",
    timeout: 60_000,
    stdout: "ignore" as const,
    stderr: "pipe" as const,
  }));
if (fakeApiReady) {
  servers.unshift({
    command: `node tests/e2e/fake-api/server.mjs ${FAKE_API_PORT}`,
    url: `http://127.0.0.1:${FAKE_API_PORT}/__health`,
    reuseExistingServer: false,
    timeout: 20_000,
    stdout: "ignore",
    stderr: "pipe",
  });
}

export default defineConfig({
  testDir: "tests/e2e",
  globalSetup: "./tests/e2e/support/global-setup.ts",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  forbidOnly: CI,
  retries: 0,
  workers: CI ? 4 : 3,
  reporter: CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  use: {
    locale: "de-DE",
    timezoneId: "Europe/Berlin",
    trace: "retain-on-failure",
    // Videos brauchen das Playwright-ffmpeg, das lokal nicht installiert ist.
    video: CI ? "retain-on-failure" : "off",
    screenshot: "only-on-failure",
  },
  projects: LIVE
    ? [{ name: "live", testDir: "tests/e2e/live", workers: 1, use: { ...chrome, baseURL: process.env.LIVE_BASE_URL ?? "https://freebie.stefanai.de" } }]
    : projects,
  webServer: LIVE ? undefined : servers,
});
