import { describe, expect, it } from "vitest";
import { consumeLoginAttempt } from "@/lib/auth/session";
import { signDevice, signSession, verifyDevice } from "@/lib/auth/tokens";

const from = (ip: string) => new Request("http://localhost/api/auth/login", { method: "POST", headers: { "x-forwarded-for": ip } });
const unique = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2)}`;

describe("Login-Bremse", () => {
  it("Fehlversuche anderer unter dem Admin-Namen sperren ein bekanntes Gerät der Kursleitung nicht aus", async () => {
    const name = unique("kursleitung");
    // Zehn Fehlversuche mit dem Namen der Kursleitung, verteilt auf viele IPs (oder alle aus dem Schulungsnetz).
    for (let i = 0; i < 10; i++) await consumeLoginAttempt(from(`10.0.0.${i}`), name, true);
    // Unbekannte Geräte bleiben gesperrt – Raten über viele IPs bleibt begrenzt.
    await expect(consumeLoginAttempt(from("10.9.9.9"), name, true)).rejects.toMatchObject({ status: 429 });

    // Das Gerät, auf dem sich die Kursleitung schon angemeldet hat, zählt für sich.
    const device = await verifyDevice(await signDevice(name, unique("geraet")), name);
    expect(device).toBeTruthy();
    const refund = await consumeLoginAttempt(from("10.0.0.1"), name, true, device);
    await refund();
    // Auch dort höchstens 10 Fehlversuche je 10 Minuten.
    for (let i = 0; i < 10; i++) await consumeLoginAttempt(from("10.0.0.1"), name, true, device);
    await expect(consumeLoginAttempt(from("10.0.0.1"), name, true, device)).rejects.toMatchObject({
      status: 429,
      message: "Zu viele Fehlversuche für diesen Benutzernamen. Bitte warte ein paar Minuten.",
    });
  });

  it("das Geräte-Cookie gilt nur unverändert und nur für den Namen, für den es ausgestellt wurde", async () => {
    const token = await signDevice("admin", "g1");
    expect(await verifyDevice(token, "admin")).toBe("g1");
    expect(await verifyDevice(token, "fuchs27")).toBeNull();
    expect(await verifyDevice(token.slice(0, -3) + "abc", "admin")).toBeNull();
    expect(await verifyDevice(undefined, "admin")).toBeNull();
    // Ein Sitzungs-Token ist kein Geräte-Cookie (anderer Empfänger).
    const session = await signSession({ sid: "s", v: 1, role: "admin", name: "admin" }, new Date(Date.now() + 60_000));
    expect(await verifyDevice(session, "admin")).toBeNull();
  });
});
