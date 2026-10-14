import { describe, expect, it } from "vitest";
import { statusMessage } from "@/lib/client/api";

// C30: Antworten ohne eigene Fehlermeldung (Fehlerseiten der Plattform) werden zu verständlichen Hinweisen.

describe("Meldungen zu HTTP-Status ohne JSON", () => {
  it("nennt Ursache und nächsten Schritt statt einer nackten Fehlernummer", () => {
    expect(statusMessage(413)).toBe("Die Anfrage ist zu groß. Bitte einen neuen Chat starten oder kleinere Dateien verwenden.");
    expect(statusMessage(504)).toMatch(/^Freebie hat zu lange gebraucht \(Zeitüberschreitung\)\./);
    expect(statusMessage(408)).toBe(statusMessage(504));
    expect(statusMessage(429)).toMatch(/sehr viele Anfragen/);
    for (const status of [500, 502, 503]) expect(statusMessage(status)).toBe("Freebie antwortet gerade nicht. Bitte gleich nochmal versuchen.");
    expect(statusMessage(418)).toBe("Unerwartete Antwort von Freebie (Fehler 418). Bitte nochmal versuchen.");
    for (const status of [400, 404, 405, 413, 422, 429, 500, 502, 503, 504]) expect(statusMessage(status)).not.toMatch(/^Fehler \d+$/);
  });
});
