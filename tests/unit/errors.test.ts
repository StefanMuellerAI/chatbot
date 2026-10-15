import { APIError } from "@anthropic-ai/sdk";
import { describe, expect, it } from "vitest";
import { userMessageFor } from "@/lib/chat/run";
import { CHAT_TOO_LONG, isProviderError, providerErrorMessage } from "@/lib/errors";

describe("providerErrorMessage", () => {
  it("nimmt die Detailmeldung bei 400 aus beiden SDK-Formaten", () => {
    expect(providerErrorMessage({ status: 400, message: "400 {…}", error: { error: { message: "zu lang" } } })).toBe("Die Anfrage wurde abgelehnt: zu lang");
    expect(providerErrorMessage({ status: 400, message: "400 zu lang", error: { message: "zu lang" } })).toBe("Die Anfrage wurde abgelehnt: zu lang");
  });

  it("W08 erkennt einen Verlauf, der nicht mehr ins Kontextfenster passt", () => {
    const anthropic = { status: 400, message: "400 {…}", error: { type: "error", error: { message: "prompt is too long: 213456 tokens > 200000 maximum" } } };
    const openai = { status: 400, message: "400 …", error: { message: "Your input exceeds the context window of this model.", code: "context_length_exceeded" } };
    for (const err of [anthropic, openai]) expect(providerErrorMessage(err)).toBe(CHAT_TOO_LONG);
  });

  it("übersetzt abgebrochene Verbindungen und Zeitüberschreitungen", () => {
    const terminated = new TypeError("terminated");
    expect(providerErrorMessage(terminated)).toBe("Die Verbindung zum Anbieter ist abgebrochen. Bitte „Neu generieren“ verwenden.");
    const connection = Object.assign(new Error("Connection error."), { name: "APIConnectionError" });
    expect(providerErrorMessage(connection)).toBe("Die Verbindung zum Anbieter ist abgebrochen. Bitte „Neu generieren“ verwenden.");
    const timeout = Object.assign(new Error("Request timed out."), { name: "APIConnectionTimeoutError" });
    expect(providerErrorMessage(timeout)).toBe("Der Anbieter hat zu lange nicht geantwortet. Bitte „Neu generieren“ verwenden.");
  });

  it("Fehler-Ereignis mitten im Claude-Stream (ohne HTTP-Status): Meldung nach Fehlertyp statt „interner Fehler“", () => {
    // So baut das Anthropic-SDK den Fehler aus „event: error“ nach HTTP 200.
    const stream = (type: NonNullable<ConstructorParameters<typeof APIError>[4]>, message: string) => new APIError(undefined, { type: "error", error: { type, message } }, undefined, new Headers(), type);
    const overloaded = stream("overloaded_error", "Overloaded");
    expect(isProviderError(overloaded)).toBe(true);
    expect(userMessageFor(overloaded)).toBe("Der Anbieter ist gerade überlastet. Bitte gleich nochmal versuchen.");
    expect(userMessageFor(stream("api_error", "Internal server error"))).toBe("Der Anbieter hat gerade Probleme. Bitte gleich nochmal versuchen.");
    expect(userMessageFor(stream("rate_limit_error", "slow down"))).toMatch(/^Der Anbieter ist gerade überlastet oder das Kontingent/);
    // Unbekannte Fehler ohne Status bleiben „intern“ (Wortlaut nur im Server-Log).
    expect(userMessageFor(new Error("db kaputt"))).toBe("Es ist ein interner Fehler aufgetreten. Bitte „Neu generieren“ verwenden.");
  });

  it("bevorzugt eigene Nutzermeldungen", () => {
    expect(providerErrorMessage({ status: 500, userMessage: "Eigene Meldung" })).toBe("Eigene Meldung");
  });
});
