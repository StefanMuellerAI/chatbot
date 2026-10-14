import { describe, expect, it } from "vitest";
import { CHAT_TOO_LONG, providerErrorMessage } from "@/lib/errors";

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

  it("bevorzugt eigene Nutzermeldungen", () => {
    expect(providerErrorMessage({ status: 500, userMessage: "Eigene Meldung" })).toBe("Eigene Meldung");
  });
});
