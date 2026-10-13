import type { APIRequestContext } from "@playwright/test";
import { expect, test, uniq } from "../support/fixtures";
import { guestApi, mailGroup } from "../support/mail";
import { askFreebie, groupChatOf, groupChatsOf, postMessage, startGroupChat } from "../support/groupchat";
import { CRON_SECRET } from "../support/servers.mjs";

// GC · Gruppenchats über die API: Rechte, Grenzen, Datenschutz und Löschen (ohne Browser).

const MOCK = "claude-sonnet-5-5";

async function errorOf(res: Awaited<ReturnType<APIRequestContext["get"]>>, status: number): Promise<string> {
  const text = await res.text();
  expect(res.status(), `${res.url()}: ${text.slice(0, 300)}`).toBe(status);
  const { error } = JSON.parse(text) as { error: string };
  expect(error).not.toMatch(/Expected|Required|Invalid input|Unexpected token|stack|at \w+ \(/);
  return error;
}

test.describe("GC · Gruppenchats über die API", () => {
  test("GC10 Nur die eigene Gruppe: Auswahl und API lehnen andere Gruppen, andere Termine und die Kursleitung ab", async ({ admin, baseURL, ip }) => {
    const { guests, others } = await mailGroup(admin, 2, 1);
    const [a, b] = guests;
    const other = await mailGroup(admin, 1);
    const apiA = await guestApi(baseURL!, ip, a);

    const candidates = (await (await apiA.get("/api/groupchats/members")).json()) as { groups: { name: string; members: string[] }[] };
    expect(candidates.groups).toHaveLength(1);
    expect(candidates.groups[0]).toMatchObject({ name: "Gruppe A", members: [b.username] });

    const reject = async (members: string[], message: string) => {
      const res = await apiA.post("/api/groupchats", { data: { title: "Darf nicht", members } });
      expect(await errorOf(res, 400)).toBe(message);
    };
    const hint = "Du kannst nur Personen aus deiner Gruppe einladen.";
    await reject([b.username, others[0].username], `„${others[0].username}“ kann nicht eingeladen werden. ${hint}`);
    await reject([other.guests[0].username], `„${other.guests[0].username}“ kann nicht eingeladen werden. ${hint}`);
    await reject(["gibtesnicht99"], `„gibtesnicht99“ kann nicht eingeladen werden. ${hint}`);
    await reject(["Kursleitung"], "„kursleitung“ kann nicht eingeladen werden. Gruppenchats sind für die Teilnehmenden einer Gruppe.");
    await reject([a.username], "Bitte wähle mindestens eine Person aus.");
    // Eine Gruppen-ID der Kursleitung zählt für Gäste nicht: es bleibt die eigene Gruppe.
    const ok = await apiA.post("/api/groupchats", { data: { title: "Eigene Gruppe", members: [b.username.toUpperCase()], groupId: "egal" } });
    expect(ok.status(), await ok.text()).toBe(200);
    expect((await groupChatsOf(apiA)).map((c) => c.title)).toEqual(["Eigene Gruppe"]);
    await apiA.dispose();
  });

  test("GC12/M03 Datenschutz: Posteingang nie verbunden, nie aus dem Antwort-Cache; fremde Chats 404, Nicht-Mitglieder erfahren nichts", async ({ admin, baseURL, ip }) => {
    const {
      guests: [a, b, c],
    } = await mailGroup(admin, 3);
    const [apiA, apiB, apiC] = await Promise.all([a, b, c].map((g) => guestApi(baseURL!, ip, g)));
    const chat = await startGroupChat(apiA, `Privat ${uniq()}`, [b.username]);

    // Das Modell versucht es trotzdem: Werkzeug-Fehler mit Hinweis.
    await postMessage(apiB, chat.id, "@Freebie lies meine E-Mails #postfach-erzwingen");
    const forced = await askFreebie(apiB, chat.id, MOCK);
    expect(forced.status).toBe(200);
    expect(forced.body).toContain("Werkzeug-Fehler: Im Gruppenchat ist der Posteingang nicht verfügbar.");
    expect(forced.body).not.toContain("Willkommen in deinem Posteingang");
    await postMessage(apiB, chat.id, "@Freebie was steht in meinem Postfach?");
    expect((await askFreebie(apiB, chat.id, MOCK)).body).toContain("Im Gruppenchat ist der Posteingang nicht verfügbar.");

    // Gleiche Frage zweimal: nie aus dem Antwort-Cache.
    const question = `@Freebie Was ist Prompt Caching? ${uniq()}`;
    for (let i = 0; i < 2; i++) {
      await postMessage(apiA, chat.id, question);
      const res = await askFreebie(apiA, chat.id, MOCK);
      expect(res.body).not.toContain('"fromCache":true');
      expect(res.body).not.toContain('"type":"cached"');
    }
    const answers = (await groupChatOf(apiA, chat.id)).messages.filter((m) => m.kind === "freebie");
    expect(answers).toHaveLength(4);
    expect(answers.every((m) => m.status === "done")).toBe(true);

    // Nicht-Mitglieder: 404 auf alles, nichts in der Statusabfrage.
    for (const [method, url, data] of [
      ["GET", `/api/groupchats/${chat.id}`],
      ["PUT", `/api/groupchats/${chat.id}`, { title: "Übernommen" }],
      ["DELETE", `/api/groupchats/${chat.id}?forAll=1`],
      ["POST", `/api/groupchats/${chat.id}/messages`, { text: "Hallo?" }],
      ["POST", `/api/groupchats/${chat.id}/freebie`, { modelId: MOCK }],
    ] as const) {
      expect(await errorOf(await apiC.fetch(url, { method, data }), 404)).toBe("Diesen Gruppenchat gibt es nicht (mehr).");
    }
    expect(await errorOf(await apiC.get("/api/groupchats/00000000-0000-0000-0000-000000000000"), 404)).toBe("Diesen Gruppenchat gibt es nicht (mehr).");
    const status = (await (await apiC.get("/api/status")).json()) as { groupChats: unknown[] };
    expect(status.groupChats).toEqual([]);
    expect((await groupChatOf(apiA, chat.id)).title).toBe(chat.title);
    await Promise.all([apiA, apiB, apiC].map((x) => x.dispose()));
  });

  test("GC14 Termin-Ende, „Jetzt beenden“, Gast, Gruppe oder Termin löschen und der Aufräumjob räumen Gruppenchats ab", async ({ admin, baseURL, ip, playwright }) => {
    // Gast gelöscht: seine Beiträge bleiben mit Namen; hat er gestartet, ist der Chat weg.
    {
      const {
        guests: [a, b, c],
      } = await mailGroup(admin, 3);
      const [apiA, apiB] = await Promise.all([a, b].map((g) => guestApi(baseURL!, ip, g)));
      const byA = await startGroupChat(apiA, "Von A", [b.username, c.username]);
      const byB = await startGroupChat(apiB, "Von B", [a.username, c.username]);
      await postMessage(apiA, byB.id, "Beitrag von A bleibt");
      await admin.json("DELETE", `/api/admin/events/guests?id=${a.id}`);
      const after = await groupChatOf(apiB, byB.id);
      expect(after.messages.find((m) => m.text === "Beitrag von A bleibt")).toMatchObject({ author: a.username });
      expect(after.members).not.toContain(a.username);
      expect((await apiB.get(`/api/groupchats/${byA.id}`)).status()).toBe(404);
      await Promise.all([apiA.dispose(), apiB.dispose()]);
    }
    // Gruppe gelöscht, Termin gelöscht, „Jetzt beenden“: alle Chats weg.
    for (const action of ["Gruppe", "Termin", "Jetzt beenden"] as const) {
      const {
        eventId,
        groupA,
        guests: [a, b],
      } = await mailGroup(admin, 2);
      const apiB = await guestApi(baseURL!, ip, b);
      const apiA = await guestApi(baseURL!, ip, a);
      const chat = await startGroupChat(apiA, action, [b.username]);
      if (action === "Gruppe") await admin.json("DELETE", `/api/admin/events/groups?id=${groupA}`);
      if (action === "Termin") await admin.json("DELETE", `/api/admin/events?id=${eventId}`);
      if (action === "Jetzt beenden") await admin.json("POST", "/api/admin/events/end", { id: eventId });
      const res = await admin.api.get(`/api/groupchats/${chat.id}`);
      expect(res.status(), action).toBe(404);
      await Promise.all([apiA.dispose(), apiB.dispose()]);
    }
    // Termin-Ende: der Aufräumjob löscht die Gruppenchats und meldet die Zahl.
    const end = Date.now() + 5_000;
    const {
      guests: [a, b],
    } = await mailGroup(admin, 2, 0, new Date(end).toISOString());
    const apiA = await guestApi(baseURL!, ip, a);
    await startGroupChat(apiA, "Kurz vor Schluss", [b.username]);
    await new Promise((r) => setTimeout(r, end - Date.now() + 500));
    const cron = await playwright.request.newContext({ baseURL, extraHTTPHeaders: { "x-forwarded-for": ip } });
    const res = await cron.get("/api/cron/cleanup", { headers: { authorization: `Bearer ${CRON_SECRET}` } });
    expect(res.status(), await res.text()).toBe(200);
    expect(((await res.json()) as { deletedGroupChats: number }).deletedGroupChats).toBeGreaterThanOrEqual(1);
    await Promise.all([cron.dispose(), apiA.dispose()]);
  });

  test("GC18 API: 401, 403, 400 mit deutscher Meldung, 404, 409 und 429", async ({ admin, baseURL, ip, playwright }) => {
    const {
      guests: [a, b, c],
    } = await mailGroup(admin, 3);
    const [apiA, apiB] = await Promise.all([a, b].map((g) => guestApi(baseURL!, ip, g)));
    const anonymous = await playwright.request.newContext({ baseURL, extraHTTPHeaders: { "x-forwarded-for": ip } });
    expect(await errorOf(await anonymous.get("/api/groupchats"), 401)).toBe("Bitte melde dich erneut an.");
    expect(await errorOf(await anonymous.get("/api/status"), 401)).toBe("Bitte melde dich erneut an.");

    // 400: Felder und Grenzen.
    expect(await errorOf(await apiA.post("/api/groupchats", { data: { title: "  ", members: [b.username] } }), 400)).toBe("Bitte gib dem Gruppenchat einen Namen.");
    expect(await errorOf(await apiA.post("/api/groupchats", { data: { title: "x".repeat(61), members: [b.username] } }), 400)).toBe(
      "Der Name ist zu lang (höchstens 60 Zeichen).",
    );
    expect(await errorOf(await apiA.post("/api/groupchats", { data: { title: "Ohne Personen", members: [] } }), 400)).toBe("Bitte wähle mindestens eine Person aus.");
    await errorOf(await apiA.post("/api/groupchats", { data: { title: "Falsch", members: "alle" } }), 400);
    await errorOf(await apiA.post("/api/groupchats", { data: { title: "Zu viel", members: [b.username], extra: 1 } }), 400);
    expect(await errorOf(await apiA.get("/api/groupchats/x?since=abc"), 400)).toBe("Ungültiger Stand.");

    const chat = await startGroupChat(apiA, `API ${uniq()}`, [b.username]);
    const base = `/api/groupchats/${chat.id}`;
    expect(await errorOf(await apiA.post(`${base}/messages`, { data: { text: "   " } }), 400)).toBe("Bitte einen Text eingeben oder eine Datei anhängen.");
    expect(await errorOf(await apiA.post(`${base}/freebie`, { data: { modelId: MOCK } }), 400)).toBe("Es gibt keine offene Frage an Freebie. Schreib „@Freebie“ in deinen Beitrag.");
    expect(await errorOf(await apiA.post(`${base}/freebie`, { data: { modelId: "gibtesnicht" } }), 400)).toBe(
      "Dieses Modell ist nicht (mehr) verfügbar. Bitte wähle ein anderes.",
    );
    await errorOf(await apiA.post(`${base}/freebie`, { data: { modelId: MOCK, effort: "maximal" } }), 400);
    expect(await errorOf(await apiA.put(base, { data: { invite: [b.username] } }), 400)).toBe(`„${b.username}“ ist schon im Gruppenchat.`);
    expect(await errorOf(await apiA.put(base, { data: { remove: a.username } }), 400)).toBe("Du hast den Chat gestartet und kannst dich nicht selbst entfernen.");
    expect(await errorOf(await apiA.put(base, { data: { remove: c.username } }), 400)).toBe(`„${c.username}“ ist nicht (mehr) im Gruppenchat.`);
    expect(await errorOf(await apiA.delete(`${base}?hide=1`), 400)).toBe("Nur verlassene Gruppenchats lassen sich aus der Liste entfernen.");

    // 403: nur die startende Person verwaltet; wer gegangen ist, schreibt nicht mehr; fremde Seiten.
    for (const data of [{ title: "Übernommen" }, { invite: [c.username] }, { remove: a.username }]) {
      expect(await errorOf(await apiB.put(base, { data }), 403)).toBe("Das kann nur die Person, die den Gruppenchat gestartet hat.");
    }
    expect(await errorOf(await apiB.delete(`${base}?forAll=1`), 403)).toBe("Das kann nur die Person, die den Gruppenchat gestartet hat.");
    expect(await errorOf(await apiA.delete(base), 403)).toBe("Du hast den Gruppenchat gestartet und kannst ihn nicht verlassen – nur für alle löschen.");
    expect(await errorOf(await apiA.post(`${base}/messages`, { data: { text: "Hallo" }, headers: { origin: "https://boese.example" } }), 403)).toBe(
      "Anfrage von einer fremden Seite abgelehnt.",
    );
    await postMessage(apiA, chat.id, "Vor dem Gehen");
    expect((await apiB.delete(base)).status()).toBe(200);
    expect(await errorOf(await apiB.post(`${base}/messages`, { data: { text: "Noch da?" } }), 403)).toBe("Du bist nicht mehr in diesem Gruppenchat und kannst nicht mehr schreiben.");
    expect(await errorOf(await apiB.post(`${base}/freebie`, { data: { modelId: MOCK } }), 403)).toBe("Du bist nicht mehr in diesem Gruppenchat und kannst nicht mehr schreiben.");

    // 409: eine laufende Antwort sperrt die nächste.
    await postMessage(apiA, chat.id, "@Freebie erzähl etwas #warten:4");
    const first = askFreebie(apiA, chat.id, MOCK);
    await expect.poll(async () => (await groupChatOf(apiA, chat.id)).messages.some((m) => m.status === "pending")).toBe(true);
    await postMessage(apiA, chat.id, "@Freebie und noch etwas");
    expect(await errorOf(await apiA.post(`${base}/freebie`, { data: { modelId: MOCK } }), 409)).toBe("Freebie antwortet gerade – bitte kurz warten und dann noch einmal fragen.");
    expect((await first).status).toBe(200);

    // 429: höchstens 30 Beiträge je Minute.
    const spam = await startGroupChat(apiA, `Viel ${uniq()}`, [c.username]);
    const results = await Promise.all(Array.from({ length: 32 }, (_, i) => apiA.post(`/api/groupchats/${spam.id}/messages`, { data: { text: `Nr. ${i}` } })));
    const limited = results.filter((r) => r.status() === 429);
    expect(limited.length).toBeGreaterThanOrEqual(1);
    expect(await errorOf(limited[0], 429)).toBe("Du hast gerade sehr viele Beiträge geschrieben. Bitte warte eine Minute.");
    await Promise.all([apiA.dispose(), apiB.dispose(), anonymous.dispose()]);
  });

  test("GC20 Grenzen: 30 Mitglieder, 10 eigene Chats, 50.000 Zeichen – verständliche Meldungen, nichts halb angelegt", async ({ admin, baseURL, ip }) => {
    const { guests } = await mailGroup(admin, 31);
    const [owner, ...rest] = guests;
    const api = await guestApi(baseURL!, ip, owner);
    const all = rest.map((g) => g.username);
    expect(await errorOf(await api.post("/api/groupchats", { data: { title: "Zu groß", members: all } }), 400)).toBe("Höchstens 30 Personen je Gruppenchat.");
    expect(await groupChatsOf(api)).toEqual([]);
    const full = await startGroupChat(api, "Voll", all.slice(0, 29));
    expect(full.members).toBe(30);
    expect(await errorOf(await api.put(`/api/groupchats/${full.id}`, { data: { invite: [all[29]] } }), 400)).toBe("Höchstens 30 Personen je Gruppenchat.");

    const text = "x".repeat(50_000);
    expect((await api.post(`/api/groupchats/${full.id}/messages`, { data: { text } })).status()).toBe(200);
    await errorOf(await api.post(`/api/groupchats/${full.id}/messages`, { data: { text: `${text}x` } }), 400);

    for (let i = 2; i <= 10; i++) await startGroupChat(api, `Chat ${i}`, [all[0]]);
    expect(await errorOf(await api.post("/api/groupchats", { data: { title: "Elf", members: [all[0]] } }), 400)).toBe(
      "Du hast schon 10 Gruppenchats gestartet. Bitte lösche erst einen davon.",
    );
    expect(await groupChatsOf(api)).toHaveLength(10);
    // Einen löschen, dann geht es wieder.
    expect((await api.delete(`/api/groupchats/${full.id}?forAll=1`)).status()).toBe(200);
    expect((await api.post("/api/groupchats", { data: { title: "Elf", members: [all[0]] } })).status()).toBe(200);
    await api.dispose();
  });
});
