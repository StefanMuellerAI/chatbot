// Gemeinsame Konstanten der Test-Server (von serve.mjs und den Tests genutzt).
export const PASSWORDS = { app: "e2e-teilnehmer", admin: "e2e-admin-passwort" };
export const SESSION_SECRET = "e2e-session-secret-0123456789abcdef";
export const CRON_SECRET = "e2e-cron-secret";
export const FAKE_API_PORT = 3300;

/** Ein Server pro Zweck: parallel nutzbare (nur lesend) und serielle (ändern Einstellungen). */
export const SERVERS = {
  mock: { port: 3100, mode: "mock" },
  "mock-serial": { port: 3101, mode: "mock" },
  fake: { port: 3200, mode: "fake" },
  "fake-serial": { port: 3201, mode: "fake" },
};

export const SERVER_ENV = {
  common: {
    APP_PASSWORD: PASSWORDS.app,
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
