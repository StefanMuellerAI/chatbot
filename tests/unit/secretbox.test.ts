import { describe, expect, it } from "vitest";
import { open, seal } from "@/lib/auth/secretbox";
import { signSession, verifySession } from "@/lib/auth/tokens";

describe("Verschlüsselte Druckkopie der Gast-Passwörter", () => {
  it("verschlüsselt mit zufälligem IV und entschlüsselt wieder", () => {
    const a = seal("sonne482");
    const b = seal("sonne482");
    expect(a).not.toBe(b);
    expect(a).not.toContain("sonne");
    expect(open(a)).toBe("sonne482");
    expect(open(b)).toBe("sonne482");
  });

  it("erkennt Manipulation und Unsinn", () => {
    const sealed = seal("tiger735");
    const parts = sealed.split(".");
    const flipped = parts[3].startsWith("A") ? `B${parts[3].slice(1)}` : `A${parts[3].slice(1)}`;
    expect(open([parts[0], parts[1], parts[2], flipped].join("."))).toBeNull();
    expect(open("v2.x.y.z")).toBeNull();
    expect(open("kaputt")).toBeNull();
  });
});

describe("Sitzungs-Token", () => {
  it("Gast-Token trägt Gast, Termin, Gruppe und läuft zum gesetzten Zeitpunkt ab", async () => {
    const expires = new Date(Date.now() + 60_000);
    const token = await signSession({ sid: "s1", v: 1, role: "guest", name: "fuchs27", gid: "g1", eid: "e1", grp: "p1" }, expires);
    const claims = await verifySession(token);
    expect(claims).toMatchObject({ role: "guest", name: "fuchs27", gid: "g1", eid: "e1", grp: "p1" });
    expect(claims!.exp).toBe(Math.floor(expires.getTime() / 1000));
    const expired = await signSession({ sid: "s2", v: 1, role: "guest", name: "x", gid: "g", eid: "e", grp: "p" }, new Date(Date.now() - 1000));
    expect(await verifySession(expired)).toBeNull();
  });

  it("Gast-Token ohne Termin wird abgelehnt", async () => {
    const token = await signSession({ sid: "s3", v: 1, role: "guest", name: "x" }, new Date(Date.now() + 60_000));
    expect(await verifySession(token)).toBeNull();
    expect(await verifySession("unsinn")).toBeNull();
  });
});
