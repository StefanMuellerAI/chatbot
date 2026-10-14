import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDb, schema } from "@/lib/db/client";
import { getSettings, updateSettings } from "@/lib/settings";

// Die Route prüft die Sitzung über Cookies – hier ein angemeldeter Gast.
vi.mock("@/lib/auth/session", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth/session")>()),
  requireUser: vi.fn(async () => ({ sid: "s", sessionHash: "h", role: "guest", username: "fuchs27", expiresAt: new Date(Date.now() + 60_000) })),
}));

const { POST } = await import("@/app/api/upload/token/route");

/** So fragt das Blob-SDK im Browser nach einem Client-Token. */
const ask = (pathname: string) =>
  POST(
    new Request("http://localhost/api/upload/token", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "blob.generate-client-token", payload: { pathname, clientPayload: null, multipart: false } }),
    }),
  );

/** Inhalt des Client-Tokens (signierter, base64-kodierter JSON-Teil). */
function tokenPayload(clientToken: string): { pathname: string; maximumSizeInBytes: number; allowOverwrite: boolean } {
  const [, payload] = Buffer.from(clientToken.replace(/^vercel_blob_client_teststore_/, ""), "base64").toString().split(".");
  return JSON.parse(Buffer.from(payload, "base64").toString());
}

const key = (name: string) => `uploads/${Math.random().toString(36).slice(2, 12)}/${name}`;

describe("Upload-Token für Vercel Blob (der Upload-Weg in Produktion)", () => {
  beforeEach(() => {
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "vercel_blob_rw_teststore_geheimesgeheimnis0123456789");
    // Audio braucht die Transkription (OpenAI).
    vi.stubEnv("OPENAI_API_KEY", "sk-test");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("U04 stellt Tokens nur für eigene Upload-Pfade und erlaubte Dateitypen aus", async () => {
    for (const pathname of ["images/abcdefgh-1234/x.png", "library/abcdefgh-1234/x.docx", "uploads/../../x.txt", "uploads/abcdefgh-1234/../x.txt"]) {
      const res = await ask(pathname);
      expect(res.status, pathname).toBe(400);
      expect((await res.json()).error, pathname).toMatch(/Ungültiger Upload-Pfad|Ungültiger Dateipfad/);
    }
    const exe = await ask(key("setup.exe"));
    expect(exe.status).toBe(400);
    expect((await exe.json()).error).not.toMatch(/kein Blob-Speicher/);
  });

  it("U04 Größengrenze je Dateityp im Token, Datei vorgemerkt, derselbe Pfad nur einmal", async () => {
    const pdf = key("bericht.pdf");
    const res = await ask(pdf);
    expect(res.status).toBe(200);
    const token = tokenPayload((await res.json()).clientToken);
    expect(token).toMatchObject({ pathname: pdf, maximumSizeInBytes: 50 * 1024 * 1024 });
    const audio = await ask(key("aufnahme.mp3"));
    expect(tokenPayload((await audio.json()).clientToken).maximumSizeInBytes).toBe(300 * 1024 * 1024);
    // Vorgemerkt, damit auch nie verarbeitete Uploads fristgerecht gelöscht werden.
    const db = await getDb();
    const [row] = await db.select().from(schema.storedFiles).where(eq(schema.storedFiles.key, pdf));
    expect(row).toMatchObject({ kind: "document" });
    expect(row.expiresAt.getTime()).toBeGreaterThan(Date.now());
    // Ein zweites Token für denselben Pfad gäbe es nur, um eine vorhandene Datei zu überschreiben.
    const again = await ask(pdf);
    expect(again.status).toBe(409);
  });

  it("Q03/Q04 ausgeschaltete Uploads bzw. Transkription: kein Token", async () => {
    const { features } = await getSettings({ fresh: true });
    try {
      await updateSettings({ features: { ...features, uploads: false } });
      expect((await ask(key("notiz.txt"))).status).toBe(403);
      expect((await ask(key("aufnahme.mp3"))).status).toBe(200);
      await updateSettings({ features: { ...features, uploads: true, transcription: false } });
      expect((await ask(key("aufnahme.mp3"))).status).toBe(403);
      expect((await ask(key("notiz.txt"))).status).toBe(200);
    } finally {
      await updateSettings({ features });
    }
  });
});
