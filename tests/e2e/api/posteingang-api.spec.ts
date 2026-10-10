import { expect, test, uniq } from "../support/fixtures";
import { address, guestApi, inboxOf, mailGroup, sendMail } from "../support/mail";

// Z16 · API des Posteingangs ohne Browser. 401 ohne Anmeldung und die 403 bei ausgeschaltetem
// Posteingang prüfen U01 und Q22, den Not-Aus Z16 im Admin-Projekt (serieller Server).

test.describe("Z16 · API des Posteingangs", () => {
  test("Z16 Eingaben: 400 mit deutscher Meldung, nichts verschickt", async ({ admin, baseURL, ip }) => {
    const {
      guests: [a, b],
      others: [x],
    } = await mailGroup(admin, 2, 1);
    const api = await guestApi(baseURL!, ip, a);
    const send = (data: unknown) => api.post("/api/mail", { data });
    const ok = { to: [b.username], cc: [], subject: "Hallo", body: "" };
    const cases: [unknown, number, string | RegExp][] = [
      [{ ...ok, to: "b" }, 400, "An: fehlt oder hat das falsche Format"],
      [{ ...ok, subject: undefined }, 400, "Betreff: fehlt oder hat das falsche Format"],
      [{ ...ok, subject: "x".repeat(201) }, 400, "Betreff: höchstens 200 Zeichen"],
      [{ ...ok, body: "x".repeat(20_001) }, 400, "Text: höchstens 20.000 Zeichen"],
      [{ ...ok, to: Array.from({ length: 51 }, (_, i) => `gast${i}`) }, 400, "An: höchstens 50 Einträge"],
      [{ ...ok, geheim: true }, 400, "Unbekanntes Feld: geheim"],
      [{ ...ok, to: [] }, 400, "Bitte gib mindestens einen Empfänger an."],
      [{ ...ok, subject: "", body: "   " }, 400, "Bitte einen Betreff oder Text eingeben."],
      [{ ...ok, to: ["jemand@gmail.com"] }, 400, "An: „jemand@gmail.com“ ist keine Adresse in Freebie (…@freebie.example)."],
      [{ ...ok, cc: ["<b>fett</b>"] }, 400, "Cc: „<b>fett</b>“ ist keine Adresse in Freebie (…@freebie.example)."],
      [{ ...ok, to: [x.username] }, 400, `„${address(x)}“ kann nicht zugestellt werden. Du kannst nur deiner Gruppe und der Kursleitung schreiben.`],
      [{ ...ok, to: ["niemand123"] }, 400, `„${address({ username: "niemand123" })}“ kann nicht zugestellt werden. Du kannst nur deiner Gruppe und der Kursleitung schreiben.`],
      [{ ...ok, to: [b.username, x.username] }, 400, /^„.*“ kann nicht zugestellt werden/],
    ];
    for (const [data, status, message] of cases) {
      const res = await send(data);
      expect(res.status(), JSON.stringify(data).slice(0, 120)).toBe(status);
      const error = ((await res.json()) as { error: string }).error;
      if (typeof message === "string") expect(error).toBe(message);
      else expect(error).toMatch(message);
    }
    const broken = await api.post("/api/mail", { headers: { "content-type": "application/json" }, data: "{kaputt" });
    expect(broken.status()).toBe(400);
    expect((await api.get("/api/mail?folder=papierkorb")).status()).toBe(400);
    expect(((await (await api.get("/api/mail?folder=papierkorb")).json()) as { error: string }).error).toBe("Unbekannter Ordner.");
    expect((await api.put("/api/mail", { data: { id: "x" } })).status()).toBe(400);
    expect((await api.delete("/api/mail")).status()).toBe(400);
    // Nichts davon wurde verschickt – auch nicht teilweise.
    expect((await inboxOf(api, "sent")).total).toBe(0);
    expect((await inboxOf(await guestApi(baseURL!, ip, b))).mails.map((m) => m.from)).toEqual(["kursleitung"]);
  });

  test("Z16 fremde und unbekannte IDs: 404 beim Lesen, Markieren und Löschen; die fremde Mail bleibt unverändert", async ({ admin, baseURL, ip }) => {
    const {
      guests: [a, b],
    } = await mailGroup(admin, 2);
    const apiA = await guestApi(baseURL!, ip, a);
    const apiB = await guestApi(baseURL!, ip, b);
    await sendMail(apiA, { to: [b.username], subject: `Nur für B ${uniq()}`, body: "geheim" });
    const target = (await inboxOf(apiB)).mails[0];
    expect(target.read).toBe(false);
    for (const id of [target.id, "00000000-0000-0000-0000-000000000000", "gibt-es-nicht"]) {
      for (const res of [
        await apiA.get(`/api/mail?id=${id}`),
        await apiA.put("/api/mail", { data: { id, read: true } }),
        await apiA.delete(`/api/mail?id=${id}`),
      ]) {
        expect(res.status(), `${res.url()} ${id}`).toBe(404);
        expect(((await res.json()) as { error: string }).error).toBe("Diese E-Mail gibt es nicht (mehr).");
      }
    }
    const after = (await inboxOf(apiB)).mails.find((m) => m.id === target.id);
    expect(after?.read).toBe(false);
    // Die eigene Kopie geht: Lesen markiert nicht automatisch, Markieren und Löschen wirken.
    const mine = await apiB.get(`/api/mail?id=${target.id}`);
    expect(((await mine.json()) as { mail: { body: string } }).mail.body).toBe("geheim");
    expect((await apiB.put("/api/mail", { data: { id: target.id, read: true } })).status()).toBe(200);
    expect((await inboxOf(apiB)).unread).toBe(1);
    expect((await apiB.delete(`/api/mail?id=${target.id}`)).status()).toBe(200);
    expect((await inboxOf(apiB)).total).toBe(1);
    expect((await inboxOf(apiA, "sent")).total).toBe(1);
  });

  test("Z16 ändernde Aufrufe von fremden Seiten werden abgewiesen", async ({ admin, baseURL, ip }) => {
    const {
      guests: [a, b],
    } = await mailGroup(admin, 2);
    const api = await guestApi(baseURL!, ip, a);
    const headers = { origin: "https://boese.example" };
    for (const res of [
      await api.post("/api/mail", { headers, data: { to: [b.username], cc: [], subject: "Phishing", body: "" } }),
      await api.put("/api/mail", { headers, data: { id: "x", read: true } }),
      await api.delete("/api/mail?id=x", { headers }),
    ]) {
      expect(res.status()).toBe(403);
      expect(((await res.json()) as { error: string }).error).toBe("Anfrage von einer fremden Seite abgelehnt.");
    }
    expect((await inboxOf(api, "sent")).total).toBe(0);
  });

  test("Z16 Bremse: ab der 21. E-Mail pro Minute 429; Status, Adressbuch und Suche", async ({ admin, baseURL, ip }) => {
    const {
      guests: [a, b],
      others: [x],
    } = await mailGroup(admin, 2, 1);
    const api = await guestApi(baseURL!, ip, a);
    for (let i = 1; i <= 20; i++) await sendMail(api, { to: [a.username], subject: `Notiz ${i} 100%_sicher`, body: i === 7 ? "Rabatt 50% auf alles" : "" });
    const res = await api.post("/api/mail", { data: { to: [b.username], cc: [], subject: "Eine zu viel", body: "" } });
    expect(res.status()).toBe(429);
    expect(((await res.json()) as { error: string }).error).toBe("Du hast gerade sehr viele E-Mails verschickt. Bitte warte eine Minute.");

    const status = (await (await api.get("/api/mail/status")).json()) as { unread: number; total: number; latest: { from: string; subject: string } };
    // 20 an sich selbst (Gesendet + Posteingang) und die Begrüßung
    expect(status).toMatchObject({ unread: 21, total: 41, latest: { from: a.username, subject: "Notiz 20 100%_sicher" } });

    const contacts = (await (await api.get("/api/mail/contacts")).json()) as {
      teacher: { local: string } | null;
      groups: { name: string; members: { local: string; address: string }[] }[];
    };
    expect(contacts.teacher?.local).toBe("kursleitung");
    expect(contacts.groups.map((g) => g.name)).toEqual(["Gruppe A"]);
    expect(contacts.groups[0].members.map((m) => m.local)).toEqual([b.username]);
    expect(JSON.stringify(contacts)).not.toContain(x.username);

    // Suche: % und _ sind normale Zeichen, keine Platzhalter.
    const search = async (q: string) => (await (await api.get(`/api/mail?folder=inbox&q=${encodeURIComponent(q)}`)).json()) as { mails: { subject: string }[] };
    expect((await search("50%")).mails.map((m) => m.subject)).toEqual(["Notiz 7 100%_sicher"]);
    expect((await search("0%_s")).mails).toHaveLength(20);
    expect((await search("%")).mails).toHaveLength(20);
    expect((await search("Notiz 1_")).mails).toHaveLength(0);
  });
});
