import { describe, expect, it } from "vitest";
import { sniffImageMime } from "@/lib/files/sniff";

describe("Bildsignaturen", () => {
  it("erkennt PNG, JPEG, GIF und WebP unabhängig von der Endung", () => {
    expect(sniffImageMime(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe("image/png");
    expect(sniffImageMime(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
    expect(sniffImageMime(new TextEncoder().encode("GIF89a"))).toBe("image/gif");
    expect(sniffImageMime(new TextEncoder().encode("RIFF\0\0\0\0WEBPVP8 "))).toBe("image/webp");
    expect(sniffImageMime(new TextEncoder().encode("<svg></svg>"))).toBeNull();
  });
});
