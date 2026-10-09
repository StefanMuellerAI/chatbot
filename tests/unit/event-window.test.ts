import { describe, expect, it } from "vitest";
import { effectiveEnd, eventStatus, formatStart, formatTime, guestAccess, guestSessionExpiry, validateEventTimes } from "@/lib/events/window";

const at = (iso: string) => new Date(iso);
const event = { startsAt: at("2026-10-10T07:00:00Z"), endsAt: at("2026-10-10T14:30:00Z"), endedEarlyAt: null as Date | null };

describe("Zeitfenster von Terminen", () => {
  it("Status: geplant, läuft, vorbei – „Jetzt beenden“ zählt als Ende", () => {
    expect(eventStatus(event, at("2026-10-10T06:59:00Z"))).toBe("geplant");
    expect(eventStatus(event, at("2026-10-10T07:00:00Z"))).toBe("laeuft");
    expect(eventStatus(event, at("2026-10-10T14:30:00Z"))).toBe("vorbei");
    const early = { ...event, endedEarlyAt: at("2026-10-10T10:00:00Z") };
    expect(effectiveEnd(early)).toEqual(at("2026-10-10T10:00:00Z"));
    expect(eventStatus(early, at("2026-10-10T10:00:01Z"))).toBe("vorbei");
  });

  it("Gäste: Anmeldung ab 30 Minuten vor Beginn bis zum Ende", () => {
    expect(guestAccess(event, at("2026-10-10T06:29:00Z"))).toEqual({ ok: false, reason: "zu-frueh", opensAt: at("2026-10-10T06:30:00Z") });
    expect(guestAccess(event, at("2026-10-10T06:30:00Z"))).toEqual({ ok: true });
    expect(guestAccess(event, at("2026-10-10T14:29:59Z"))).toEqual({ ok: true });
    expect(guestAccess(event, at("2026-10-10T14:30:00Z"))).toEqual({ ok: false, reason: "vorbei" });
  });

  it("Sitzung eines Gastes endet spätestens mit dem Termin", () => {
    expect(guestSessionExpiry(event, at("2026-10-10T08:00:00Z"))).toEqual(at("2026-10-10T14:30:00Z"));
    const long = { ...event, endsAt: at("2026-10-11T06:00:00Z") };
    expect(guestSessionExpiry(long, at("2026-10-10T08:00:00Z"))).toEqual(at("2026-10-10T20:00:00Z"));
  });

  it("Prüfung von Beginn und Ende", () => {
    const now = at("2026-10-09T12:00:00Z");
    expect(validateEventTimes(event.startsAt, event.endsAt, now)).toBeNull();
    expect(validateEventTimes(event.endsAt, event.startsAt, now)).toBe("Das Ende muss nach dem Beginn liegen.");
    expect(validateEventTimes(event.startsAt, at("2026-10-11T07:00:01Z"), now)).toBe("Ein Termin dauert höchstens 24 Stunden.");
    expect(validateEventTimes(event.startsAt, at("2026-10-11T07:00:00Z"), now)).toBeNull();
    expect(validateEventTimes(at("2026-10-08T07:00:00Z"), at("2026-10-08T09:00:00Z"), now)).toBe("Das Ende liegt in der Vergangenheit.");
    expect(validateEventTimes(new Date(Number.NaN), event.endsAt, now)).toBe("Bitte Beginn und Ende angeben.");
  });

  it("Zeiten in deutscher Ortszeit", () => {
    expect(formatStart(event.startsAt)).toBe("10. Oktober um 9:00 Uhr");
    expect(formatTime(event.endsAt)).toBe("16:30");
  });
});
