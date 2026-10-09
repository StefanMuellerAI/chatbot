// Gemeinsame Konstanten der Test-Server (von serve.mjs und den Tests genutzt).
export const PASSWORDS = { admin: "e2e-admin-passwort" };
export const ADMIN = { username: "admin", password: PASSWORDS.admin };
/** Ein Termin pro Testserver, in dem jeder Test seinen eigenen Gast bekommt. */
export const TEST_EVENT = "E2E-Testtermin";
export const SESSION_SECRET = "e2e-session-secret-0123456789abcdef";
export const CRON_SECRET = "e2e-cron-secret";
export const FAKE_API_PORT = 3300;
/** Feste Nutzungswerte jeder Fake-Antwort, damit Tests Kosten exakt nachrechnen können. */
export const FAKE_USAGE = { input: 1200, output: 300, cacheRead: 4000, cacheWrite: 800 };

/** Ein Server pro Zweck: parallel nutzbare (nur lesend) und serielle (ändern Einstellungen). */
export const SERVERS = {
  mock: { port: 3100, mode: "mock" },
  "mock-serial": { port: 3101, mode: "mock" },
  fake: { port: 3200, mode: "fake" },
  "fake-serial": { port: 3201, mode: "fake" },
};

export const SERVER_ENV = {
  common: {
    ADMIN_PASSWORD: PASSWORDS.admin,
    SESSION_SECRET,
    CRON_SECRET,
  },
  mock: { FREEBIE_MOCK: "1" },
  fake: {
    FREEBIE_MOCK: "0",
    ANTHROPIC_API_KEY: "fake-anthropic-key",
    OPENAI_API_KEY: "fake-openai-key",
    ANTHROPIC_BASE_URL: `http://127.0.0.1:${FAKE_API_PORT}`,
    OPENAI_BASE_URL: `http://127.0.0.1:${FAKE_API_PORT}/v1`,
  },
};

export const baseUrl = (name) => `http://localhost:${SERVERS[name].port}`;
