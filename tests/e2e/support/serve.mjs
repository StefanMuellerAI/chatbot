// Startet eine Freebie-Instanz (Produktions-Build) für die E2E-Tests mit frischer Datenbank.
// Aufruf: node tests/e2e/support/serve.mjs <name> <port> <mock|fake>
import { spawn } from "node:child_process";
import { rmSync } from "node:fs";
import path from "node:path";
import { SERVER_ENV } from "./servers.mjs";

const [name, port, mode] = process.argv.slice(2);
if (!name || !port || !["mock", "fake"].includes(mode)) {
  console.error("Aufruf: serve.mjs <name> <port> <mock|fake>");
  process.exit(1);
}

const dataDir = path.resolve(".data/e2e", name);
rmSync(dataDir, { recursive: true, force: true });

// Keine echten Schlüssel oder Speicher aus der Umgebung übernehmen.
const env = Object.fromEntries(
  Object.entries(process.env).filter(
    ([k]) => !/^(ANTHROPIC_|OPENAI_|BLOB_|DATABASE_URL|POSTGRES_|VERCEL)/.test(k) && !/_(READ_WRITE_TOKEN|STORE_ID)$/.test(k),
  ),
);
Object.assign(env, SERVER_ENV.common, SERVER_ENV[mode], {
  PORT: port,
  PGLITE_DIR: path.join(dataDir, "pglite"),
  FREEBIE_FILES_DIR: path.join(dataDir, "files"),
});

const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", port], { env, stdio: "inherit" });
const stop = () => child.kill("SIGTERM");
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
child.on("exit", (code) => process.exit(code ?? 0));
