import { describe, expect, it } from "vitest";
import { assertSafeKey, blobAuth, isUserKey, KEEP_FOREVER } from "@/lib/storage";

describe("blobAuth", () => {
  it("erkennt den klassischen Token", () => {
    expect(blobAuth({ BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_abc_123" })).toEqual({
      kind: "token",
      token: "vercel_blob_rw_abc_123",
      source: "BLOB_READ_WRITE_TOKEN",
    });
  });

  it("erkennt OIDC-Stores an BLOB_STORE_ID", () => {
    expect(blobAuth({ BLOB_STORE_ID: "store_abc" })).toEqual({ kind: "oidc", storeId: "store_abc", source: "BLOB_STORE_ID" });
  });

  it("bevorzugt den Token, wenn beides gesetzt ist", () => {
    expect(blobAuth({ BLOB_STORE_ID: "store_abc", BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_abc_1" })?.kind).toBe("token");
  });

  it("findet Variablen mit eigenem Präfix", () => {
    expect(blobAuth({ FREEBIE_READ_WRITE_TOKEN: "vercel_blob_rw_abc_1" })).toMatchObject({ kind: "token", source: "FREEBIE_READ_WRITE_TOKEN" });
    expect(blobAuth({ FREEBIE_STORE_ID: "store_xyz" })).toMatchObject({ kind: "oidc", storeId: "store_xyz", source: "FREEBIE_STORE_ID" });
  });

  it("ignoriert fremde und mehrdeutige Variablen", () => {
    expect(blobAuth({})).toBeNull();
    expect(blobAuth({ BLOB_READ_WRITE_TOKEN: "  " })).toBeNull();
    expect(blobAuth({ OTHER_READ_WRITE_TOKEN: "kein-blob-token" })).toBeNull();
    expect(blobAuth({ A_STORE_ID: "store_1", B_STORE_ID: "store_2" })).toBeNull();
  });
});

describe("Dateischlüssel", () => {
  it("erlaubt den Fundus der Kursleitung, aber nicht für Teilnehmende", () => {
    const fundus = "fundus/0f8fad5b-d9cb-469f-a165-70867728950e/Bericht.pdf";
    expect(() => assertSafeKey(fundus)).not.toThrow();
    expect(isUserKey(fundus)).toBe(false);
    expect(isUserKey("uploads/0f8fad5b-d9cb-469f-a165-70867728950e/a.pdf")).toBe(true);
    for (const bad of ["library/x/y.pdf", "fundus/../uploads/x.pdf", "fundus/kurz/x.pdf", "Fundus/0f8fad5b-d9cb-469f-a165-70867728950e/x.pdf"]) {
      expect(() => assertSafeKey(bad), bad).toThrow("Ungültiger Dateipfad.");
    }
  });

  it("dauerhaft gespeicherte Dateien laufen nie ab", () => {
    expect(KEEP_FOREVER.getTime()).toBeGreaterThan(Date.UTC(9000, 0, 1));
  });
});
