import { describe, expect, it } from "vitest";
import { blobAuth } from "@/lib/storage";

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
