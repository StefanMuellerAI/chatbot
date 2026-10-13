import { readFileSync } from "node:fs";
import { expectAccessible } from "../support/a11y";
import { expectReady, freshPayload } from "../support/files";
import { ChatPage, expect, ipFor, loginUser, openChat, test, uniq, type AdminApi, type Guest } from "../support/fixtures";
import { ADMIN } from "../support/servers.mjs";
import { guestApi, mailGroup, MailPage } from "../support/mail";
import { askFreebie, GroupChatPage, groupChatOf, groupChatsOf, postMessage, startGroupChat } from "../support/groupchat";

// GC · Gruppenchats (Plan: GRUPPENCHAT-PLAN.md). Jeder Test hat einen eigenen Termin mit einer Gruppe;
// Gruppenchats gibt es nur innerhalb dieser Gruppe. Die Abfrage läuft im offenen Chat alle 4 Sekunden,
// die Statusabfrage (Einladungen) alle 15 Sekunden – wo nötig spult der Test die Browser-Uhr vor.

const MOCK = "claude-sonnet-5-5";

/** Drei Gäste einer Gruppe; A und B im Browser, C nur über die API. */
async function trio(admin: AdminApi, browser: Parameters<typeof openChat>[0], baseURL: string, ip: string, opts: { clockB?: boolean } = {}) {
  const { guests, eventId, eventName } = await mailGroup(admin, 3);
  const [a, b, c] = guests as [Guest, Guest, Guest];
  const chatA = await openChat(browser, baseURL, ip, { guest: a });
  const chatB = await openChat(browser, baseURL, ipFor(`${ip}-b`), { guest: b });
  if (opts.clockB) {
    await chatB.page.clock.install();
    await chatB.open();
  }
  return { a, b, c, chatA, chatB, eventId, eventName, gA: GroupChatPage.of(chatA), gB: GroupChatPage.of(chatB) };
}

test.describe("GC · Gruppenchats", () => {
  test("GC01 Gruppenchat starten: Symbol neben „Neuer Chat“, Dialog mit Name, Suche und „Alle auswählen“; Prüfungen", async ({ browser, baseURL, ip, admin }) => {
    const { b, c, chatA, gA } = await trio(admin, browser, baseURL!, ip);
    await gA.newButton.click();
    const d = gA.dialog;
    await expect(d).toBeVisible();
    await expect(d.getByRole("combobox", { name: "Gruppe" })).toHaveCount(0);
    await expect(d).toContainText("deine Gruppe „Gruppe A“");
    const people = d.getByRole("group", { name: "Personen" });
    await expect(people.getByRole("checkbox")).toHaveCount(2);
    await expect(people.getByRole("checkbox", { name: chatA.guest!.username })).toHaveCount(0);

    // Ohne Namen bzw. ohne Personen: deutsche Meldung, nichts angelegt.
    await d.getByRole("button", { name: "Chat starten" }).click();
    await expect(d.getByRole("alert")).toHaveText("Bitte gib dem Gruppenchat einen Namen.");
    const title = `Teamrunde ${uniq()}`;
    await d.getByRole("textbox", { name: "Name" }).fill(title);
    await d.getByRole("button", { name: "Chat starten" }).click();
    await expect(d.getByRole("alert")).toHaveText("Bitte wähle mindestens eine Person aus.");
    // Der Name ist auf 60 Zeichen begrenzt.
    await d.getByRole("textbox", { name: "Name" }).fill("x".repeat(80));
    await expect(d.getByRole("textbox", { name: "Name" })).toHaveValue("x".repeat(60));
    await d.getByRole("textbox", { name: "Name" }).fill(title);

    // Suche und „Alle auswählen“.
    await d.getByRole("searchbox", { name: "Personen suchen" }).fill(b.username);
    await expect(people.getByRole("checkbox")).toHaveCount(1);
    await d.getByRole("searchbox", { name: "Personen suchen" }).fill("");
    await d.getByRole("button", { name: "Alle auswählen" }).click();
    await expect(d).toContainText("2 Personen ausgewählt");
    await d.getByRole("button", { name: "Auswahl aufheben" }).click();
    await expect(d).toContainText("0 Personen ausgewählt");
    await people.getByRole("checkbox", { name: b.username }).check();
    await people.getByRole("checkbox", { name: c.username }).check();
    await expect(d).toContainText("2 Personen ausgewählt");
    expect(await groupChatsOf(chatA.page.request)).toEqual([]);
    await d.getByRole("button", { name: "Chat starten" }).click();
    await expect(d).toBeHidden();

    await expect(chatA.page.getByRole("status").filter({ hasText: `Gruppenchat „${title}“ gestartet – die Eingeladenen sehen ihn sofort.` })).toBeVisible();
    await expect(gA.heading).toHaveText(title);
    await expect(gA.entry(title)).toHaveAttribute("aria-current", "page");
    await expect(gA.membersButton).toHaveAccessibleName("Mitglieder (3)");
    await expect(gA.notes.filter({ hasText: `Du hast ${b.username} und ${c.username} eingeladen` })).toBeVisible();
    await expect(chatA.page.getByRole("region", { name: "So funktioniert euer Gruppenchat" })).toBeVisible();
    await expect(gA.composer).toHaveAttribute("placeholder", "Schreib der Gruppe … – mit @Freebie fragst du Freebie");
    await expect(chatA.page.getByText("Alle Mitglieder sehen, was du hier schreibst. Bitte keine echten oder vertraulichen Daten.")).toBeVisible();

    // „Neuer Chat“ führt zurück zum privaten Chat; der Gruppenchat bleibt in der Leiste.
    await chatA.newChat();
    await expect(chatA.page.getByRole("heading", { level: 1 })).not.toHaveText(title);
    await expect(gA.entry(title)).not.toHaveAttribute("aria-current", "page");
    await gA.open(title);
  });

  test("GC02 Einladung kommt an: B sieht den Chat ohne Neuladen mit Hinweis, Punkt und „Öffnen“; C sieht nichts", async ({ browser, baseURL, ip, admin }) => {
    const { b, c, chatA, chatB, gB, a } = await trio(admin, browser, baseURL!, ip, { clockB: true });
    // B ist gerade im Posteingang – der Punkt erscheint dann am Reiter „Chat“.
    const mailB = MailPage.of(chatB);
    await mailB.open();
    const title = `Protokoll ${uniq()}`;
    const chat = await startGroupChat(chatA.page.request, title, [b.username]);
    expect(chat).toMatchObject({ title, owner: a.username, mine: true, members: 2 });

    await chatB.page.clock.fastForward("00:16");
    const toast = chatB.page.getByRole("status").filter({ hasText: `${a.username} hat dich in „${title}“ eingeladen` });
    await expect(toast).toBeVisible();
    await expect(mailB.chatTab).toHaveCount(0);
    await expect(mailB.switcher.getByRole("button", { name: "Chat, neue Nachrichten" })).toBeVisible();
    await toast.getByRole("button", { name: "Öffnen" }).click();
    await expect(gB.heading).toHaveText(title);
    await expect(gB.notes.filter({ hasText: `${a.username} hat dich eingeladen` })).toBeVisible();
    await expect(gB.entry(title)).toHaveAccessibleName(title);
    await expect(mailB.chatTab).toBeVisible();

    // C ist in derselben Gruppe, aber nicht eingeladen.
    const apiC = await guestApi(baseURL!, ip, c);
    expect(await groupChatsOf(apiC)).toEqual([]);
    expect((await apiC.get(`/api/groupchats/${chat.id}`)).status()).toBe(404);
    const status = (await (await apiC.get("/api/status")).json()) as { groupChats: unknown[] };
    expect(status.groupChats).toEqual([]);
    await apiC.dispose();
  });

  test("GC03 Beiträge untereinander: B sieht A binnen Sekunden links mit Name, eigene rechts; ohne @Freebie keine Antwort", async ({ browser, baseURL, ip, admin }) => {
    const { a, b, c, chatA, chatB, gA, gB } = await trio(admin, browser, baseURL!, ip);
    const title = `Notizen ${uniq()}`;
    await gA.start(title, [b.username, c.username]);
    await chatB.page.reload();
    await gB.open(title);

    await gA.post("TOP 1: Raumplanung – Saal B ist frei");
    await expect(gB.from(a.username)).toContainText("TOP 1: Raumplanung – Saal B ist frei");
    await expect(gB.from(a.username)).toContainText(a.username);
    await gB.post("TOP 2: Budget bleibt bei 500 €");
    await expect(gA.from(b.username)).toContainText("TOP 2: Budget bleibt bei 500 €");
    await expect(gA.mine).toHaveCount(1);
    await expect(gA.answers).toHaveCount(0);

    // Gleichzeitig gepostet: bei allen dieselbe Reihenfolge.
    const apiC = await guestApi(baseURL!, ip, c);
    const chatId = (await groupChatsOf(apiC))[0].id;
    await Promise.all([
      ...Array.from({ length: 4 }, (_, i) => postMessage(chatA.page.request, chatId, `A${i}`)),
      ...Array.from({ length: 4 }, (_, i) => postMessage(chatB.page.request, chatId, `B${i}`)),
      ...Array.from({ length: 4 }, (_, i) => postMessage(apiC, chatId, `C${i}`)),
    ]);
    const order = (await groupChatOf(apiC, chatId)).messages.filter((m) => m.kind === "person").map((m) => m.text);
    expect(order).toHaveLength(14);
    const shown = async (g: GroupChatPage) => {
      await expect(g.conversation.getByRole("article")).toHaveCount(14);
      return (await g.conversation.getByRole("article").allInnerTexts()).map((t) => order.find((o) => t.includes(o)));
    };
    expect(await shown(gA)).toEqual(order);
    expect(await shown(gB)).toEqual(order);
    await expect(gA.answers).toHaveCount(0);
    await apiC.dispose();
  });

  test("GC04 @Freebie: Vorschlag bei „@“, Antwort mit Bezug auf alle Beiträge; die anderen sehen erst „antwortet …“, dann die fertige Antwort", async ({ browser, baseURL, ip, admin }) => {
    const { a, b, chatA, chatB, gA, gB } = await trio(admin, browser, baseURL!, ip);
    const title = `Zusammenfassung ${uniq()}`;
    await gA.start(title, [b.username]);
    await chatB.page.reload();
    await gB.open(title);
    await gB.post("Notiz von B: Termin am Freitag");
    await expect(gA.from(b.username)).toBeVisible();

    // Vorschlagsliste: mit der Maus …
    await gA.composer.fill("Danke! @");
    const list = chatA.page.getByRole("listbox", { name: "Vorschläge" });
    await expect(list).toBeVisible();
    await list.getByRole("option", { name: /@Freebie/ }).click();
    await expect(gA.composer).toHaveValue("Danke! @Freebie ");
    await expect(list).toBeHidden();
    // … und mit der Tastatur (Enter übernimmt, Esc schließt).
    await gA.composer.fill("@fr");
    await expect(list).toBeVisible();
    await gA.composer.press("Escape");
    await expect(list).toBeHidden();
    await gA.composer.fill("@Fre");
    await gA.composer.press("Enter");
    await expect(gA.composer).toHaveValue("@Freebie ");
    await expect(gA.mine).toHaveCount(0);

    // Acht Sekunden Denkpause: B fragt alle 4 Sekunden ab und sieht so sicher den Zwischenstand.
    await gA.composer.fill("@Freebie fasse zusammen #warten:8");
    await gA.sendButton.click();
    // A sieht den Stream (mit Stopp-Knopf), B nur „Freebie antwortet …“.
    await expect(chatA.page.getByRole("button", { name: "Antwort stoppen" })).toBeVisible();
    const pendingB = gB.conversation.getByRole("status").filter({ hasText: `Freebie antwortet ${a.username} …` });
    await expect(pendingB).toBeVisible();
    await expect(gB.answers).toHaveAttribute("aria-busy", "true");
    await expect(gB.answers).not.toContainText("Testmodus");
    await expect(chatB.page.getByRole("button", { name: "Antwort stoppen" })).toHaveCount(0);

    await gA.waitForAnswer(1);
    await gB.waitForAnswer(1);
    for (const g of [gA, gB]) {
      await expect(g.answers.last()).toContainText("Testmodus");
      await expect(g.answers.last()).toContainText("fasse zusammen");
    }
    const chatPage = new ChatPage(chatB.page);
    expect(await chatPage.diagnosis(gB.answers.last(), "Gruppenchat")).toBe(`2 Beiträge von ${b.username}, ${a.username}`);
    expect(await chatPage.diagnosis(gB.answers.last(), "Posteingang")).toBe("im Gruppenchat nicht verfügbar");
    await expect(chatA.page.getByText(`Freebie · antwortet dir`)).toBeVisible();
    await expect(chatB.page.getByText(`Freebie · antwortet ${a.username}`)).toBeVisible();
  });

  test("GC05 Zwei fragen gleichzeitig: eine Antwort, die zweite Frage bekommt „Freebie antwortet gerade …“; Beiträge gehen weiter", async ({ browser, baseURL, ip, admin }) => {
    const { b, chatA, chatB, gA, gB } = await trio(admin, browser, baseURL!, ip);
    const title = `Gleichzeitig ${uniq()}`;
    const { id } = await startGroupChat(chatA.page.request, title, [b.username]);
    await chatA.page.reload();
    await chatB.page.reload();
    await gA.open(title);
    await gB.open(title);

    await gA.composer.fill("@Freebie erste Frage #warten:10");
    await gA.sendButton.click();
    await expect(chatA.page.getByRole("button", { name: "Antwort stoppen" })).toBeVisible();
    // API: zweite Frage während der ersten → 409.
    await postMessage(chatB.page.request, id, "@Freebie zweite Frage");
    const second = await askFreebie(chatB.page.request, id, MOCK);
    expect(second.status).toBe(409);
    expect(JSON.parse(second.body).error).toBe("Freebie antwortet gerade – bitte kurz warten und dann noch einmal fragen.");
    // Oberfläche: Hinweis statt zweiter Antwort, normale Beiträge gehen weiter.
    await gB.composer.fill("@Freebie dritte Frage");
    await gB.sendButton.click();
    await expect(chatB.page.getByRole("status").filter({ hasText: "Freebie antwortet gerade – bitte kurz warten und dann noch einmal fragen." })).toBeVisible();
    await gB.post("Nur eine Notiz");

    await gA.waitForAnswer(1);
    await gB.waitForAnswer(1);
    const messages = (await groupChatOf(chatB.page.request, id)).messages.filter((m) => m.kind !== "system");
    expect(messages.map((m) => (m.kind === "freebie" ? "Freebie" : m.text))).toEqual([
      "@Freebie erste Frage #warten:10",
      "Freebie",
      "@Freebie zweite Frage",
      "@Freebie dritte Frage",
      "Nur eine Notiz",
    ]);
    // Die späteren Beiträge gehören zur nächsten Runde.
    await gB.composer.fill("@Freebie jetzt bitte");
    await gB.sendButton.click();
    await gB.waitForAnswer(2);
    expect(await new ChatPage(chatB.page).diagnosis(gB.answers.last(), "Gruppenchat")).toBe(`4 Beiträge von ${b.username}`);
  });

  test("GC06 Stoppen nur für die fragende Person, Fehler bei allen sichtbar, „Neu generieren“ nur an der letzten Antwort; abgebrochener Browser gibt den Chat frei", async ({ browser, baseURL, ip, admin }) => {
    const { a, b, chatA, chatB, gA, gB } = await trio(admin, browser, baseURL!, ip);
    const title = `Stopp ${uniq()}`;
    const { id } = await startGroupChat(chatA.page.request, title, [b.username]);
    await chatA.page.reload();
    await chatB.page.reload();
    await gA.open(title);
    await gB.open(title);

    // Stoppen: nur A hat den Knopf; danach sehen beide „Abgebrochen“.
    await gA.composer.fill("@Freebie erzähl etwas Langes #langsam #lang");
    await gA.sendButton.click();
    const stop = chatA.page.getByRole("button", { name: "Antwort stoppen" });
    await expect(stop).toBeVisible();
    await expect(gB.conversation.getByRole("status").filter({ hasText: `Freebie antwortet ${a.username} …` })).toBeVisible();
    await expect(chatB.page.getByRole("button", { name: "Antwort stoppen" })).toHaveCount(0);
    await stop.click();
    await gA.waitForAnswer(1);
    await gB.waitForAnswer(1);
    await expect(gB.answers.last()).toContainText("Abgebrochen");

    // Fehler: bei allen sichtbar.
    await gB.composer.fill("@Freebie #fehler:500");
    await gB.sendButton.click();
    await gB.waitForAnswer(2);
    await gA.waitForAnswer(2);
    await expect(gA.answers.last()).toContainText(/Fehler|nicht geklappt|Problem/);

    // „Neu generieren“: nur an der letzten Antwort und nur, solange danach nichts kam.
    await expect(gA.answers.first().getByRole("button", { name: "Neu generieren" })).toHaveCount(0);
    await gA.composer.fill("@Freebie noch einmal");
    await gA.sendButton.click();
    await gA.waitForAnswer(3);
    await gB.waitForAnswer(3);
    const regenerate = gB.answers.last().getByRole("button", { name: "Neu generieren" });
    await expect(regenerate).toBeVisible();
    await regenerate.click();
    await gB.waitForAnswer(3);
    await expect(gA.conversation.getByText(`Freebie · antwortet ${b.username}`)).toBeVisible();
    await gA.post("Danach eine Notiz");
    await expect(gB.from(a.username).last()).toContainText("Danach eine Notiz");
    await expect(gB.answers.last().getByRole("button", { name: "Neu generieren" })).toHaveCount(0);
    const res = await askFreebie(chatA.page.request, id, MOCK, { regenerate: true });
    expect(res.status).toBe(400);
    expect(JSON.parse(res.body).error).toBe("„Neu generieren“ geht nur bei der letzten Antwort, solange danach niemand geschrieben hat.");

    // Der fragende Browser bricht ab (Fenster zu): die Antwort wird gespeichert, der Chat ist wieder frei.
    await gA.composer.fill("@Freebie lange Antwort #langsam #lang");
    await gA.sendButton.click();
    await expect(chatA.page.getByRole("button", { name: "Antwort stoppen" })).toBeVisible();
    await chatA.page.context().close();
    await gB.waitForAnswer(4);
    await gB.composer.fill("@Freebie geht wieder");
    await gB.sendButton.click();
    await gB.waitForAnswer(5);
  });

  test("GC07 Mitglieder verwalten: nachträglich einladen, entfernen mit Rückfrage, umbenennen; Entfernte lesen nur bis zum Entfernen", async ({ browser, baseURL, ip, admin }) => {
    const { a, b, c, chatA, chatB, gA, gB } = await trio(admin, browser, baseURL!, ip);
    const title = `Mitglieder ${uniq()}`;
    const { id } = await startGroupChat(chatA.page.request, title, [b.username]);
    await chatA.page.reload();
    await chatB.page.reload();
    await gA.open(title);
    await gB.open(title);

    // Nur die startende Person hat die Knöpfe zum Verwalten.
    await gB.membersButton.click();
    await expect(gB.membersDialog.getByRole("list", { name: "Mitglieder" }).getByRole("listitem")).toHaveCount(2);
    await expect(gB.membersDialog.getByText("hat den Chat gestartet")).toBeVisible();
    for (const name of ["Personen einladen", "Umbenennen", "Für alle löschen", `${a.username} entfernen`]) {
      await expect(gB.membersDialog.getByRole("button", { name })).toHaveCount(0);
    }
    await expect(gB.membersDialog.getByRole("button", { name: "Chat verlassen" })).toBeVisible();
    await chatB.page.keyboard.press("Escape");

    // Einladen.
    await gA.membersButton.click();
    const d = gA.membersDialog;
    await expect(d.getByRole("button", { name: "Chat verlassen" })).toHaveCount(0);
    await d.getByRole("button", { name: "Personen einladen" }).click();
    await d.getByRole("checkbox", { name: c.username }).check();
    await d.getByRole("button", { name: "Einladen" }).click();
    await expect(d.getByRole("list", { name: "Mitglieder" }).getByRole("listitem")).toHaveCount(3);
    await expect(gA.notes.filter({ hasText: `Du hast ${c.username} eingeladen` })).toBeVisible();

    // Umbenennen.
    const renamed = `Neu ${uniq()}`;
    await d.getByRole("button", { name: "Umbenennen" }).click();
    await d.getByRole("textbox", { name: "Neuer Name" }).fill(renamed);
    await d.getByRole("button", { name: "Speichern" }).click();
    await expect(gA.heading).toHaveText(renamed);
    await expect(gA.notes.filter({ hasText: `Du hast den Chat in „${renamed}“ umbenannt` })).toBeVisible();
    await expect(gB.heading).toHaveText(renamed);

    // Entfernen mit Rückfrage (erst abbrechen, dann bestätigen).
    await d.getByRole("button", { name: `${b.username} entfernen` }).click();
    await expect(d.getByRole("alert")).toContainText(b.username);
    await d.getByRole("alert").getByRole("button", { name: "Abbrechen" }).click();
    await expect(d.getByRole("list", { name: "Mitglieder" }).getByRole("listitem")).toHaveCount(3);
    await d.getByRole("button", { name: `${b.username} entfernen` }).click();
    await d.getByRole("alert").getByRole("button", { name: "Entfernen" }).click();
    await expect(d.getByRole("list", { name: "Mitglieder" }).getByRole("listitem")).toHaveCount(2);
    await chatA.page.keyboard.press("Escape");
    await expect(gA.notes.filter({ hasText: `Du hast ${b.username} entfernt` })).toBeVisible();

    // B: Hinweis statt Eingabeleiste, „verlassen“ in der Leiste, nichts Späteres.
    await expect(chatB.page.getByRole("note").filter({ hasText: "aus diesem Gruppenchat entfernt" })).toContainText(`${a.username} hat dich`);
    await expect(gB.composer).toHaveCount(0);
    await expect(gB.entry(renamed)).toHaveAccessibleName(`${renamed}, verlassen`);
    await gA.post(`Geheim nach dem Entfernen ${uniq()}`);
    const apiB = chatB.page.request;
    const seen = await groupChatOf(apiB, id);
    expect(seen.left).toBe(true);
    expect(seen.messages.map((m) => m.text).join(" ")).not.toContain("Geheim nach dem Entfernen");
    const write = await apiB.post(`/api/groupchats/${id}/messages`, { data: { text: "Darf ich noch?" } });
    expect(write.status()).toBe(403);
    expect(((await write.json()) as { error: string }).error).toBe("Du bist nicht mehr in diesem Gruppenchat und kannst nicht mehr schreiben.");

    // Erneut eingeladen: B sieht wieder alles.
    await startInvite(chatA, id, [b.username]);
    await expect(gB.composer).toBeVisible({ timeout: 20_000 });
    await expect(gB.from(a.username).last()).toContainText("Geheim nach dem Entfernen");
  });

  test("GC08 Verlassen, „Aus meiner Liste entfernen“ und „Für alle löschen“", async ({ browser, baseURL, ip, admin }) => {
    const { a, b, c, chatA, chatB, gA, gB } = await trio(admin, browser, baseURL!, ip);
    const title = `Verlassen ${uniq()}`;
    const { id } = await startGroupChat(chatA.page.request, title, [b.username, c.username]);
    await postMessage(chatA.page.request, id, "Vor dem Verlassen");
    await chatA.page.reload();
    await chatB.page.reload();
    await gA.open(title);
    await gB.open(title);

    // Die startende Person kann nicht verlassen (auch nicht über die API).
    const ownerLeaves = await chatA.page.request.delete(`/api/groupchats/${id}`);
    expect(ownerLeaves.status()).toBe(403);
    expect(((await ownerLeaves.json()) as { error: string }).error).toBe("Du hast den Gruppenchat gestartet und kannst ihn nicht verlassen – nur für alle löschen.");

    // B verlässt mit Rückfrage.
    await gB.membersButton.click();
    await gB.membersDialog.getByRole("button", { name: "Chat verlassen" }).click();
    await expect(gB.membersDialog.getByRole("alert")).toBeVisible();
    await gB.membersDialog.getByRole("alert").getByRole("button", { name: "Verlassen" }).click();
    await expect(gB.membersDialog).toBeHidden();
    await expect(gB.entry(title)).toHaveAccessibleName(`${title}, verlassen`);
    await expect(gB.composer).toHaveCount(0);
    await expect(chatB.page.getByRole("note").filter({ hasText: "Du hast diesen Gruppenchat" })).toContainText(`Nur ${a.username} kann dich wieder einladen.`);
    await expect(gB.from(a.username)).toContainText("Vor dem Verlassen");
    await expect(gA.notes.filter({ hasText: `${b.username} hat den Chat verlassen` })).toBeVisible();

    // Spätere Beiträge und Antworten kommen bei B nicht an – auch nicht über API und Statusabfrage.
    await gA.post("Nach dem Verlassen @Freebie fasse zusammen");
    await gA.waitForAnswer(1);
    const seen = await groupChatOf(chatB.page.request, id);
    expect(seen.messages.some((m) => m.text.includes("Nach dem Verlassen") || m.kind === "freebie")).toBe(false);
    const status = (await (await chatB.page.request.get("/api/status")).json()) as { groupChats: { id: string; unread: boolean; left: boolean }[] };
    expect(status.groupChats.find((g) => g.id === id)).toMatchObject({ left: true, unread: false });

    // „Aus meiner Liste entfernen“.
    await chatB.page.getByRole("button", { name: "Aus meiner Liste entfernen" }).click();
    await expect(gB.entry(title)).toHaveCount(0);
    await expect(chatB.page.getByRole("status").filter({ hasText: "Aus deiner Liste entfernt." })).toBeVisible();
    expect(await groupChatsOf(chatB.page.request)).toEqual([]);

    // „Für alle löschen“ (mit Rückfrage) – bei C verschwindet der offene Chat sauber.
    const chatC = await openChat(browser, baseURL!, ipFor(`${ip}-c`), { guest: c });
    const gC = GroupChatPage.of(chatC);
    await gC.open(title);
    await gA.membersButton.click();
    await gA.membersDialog.getByRole("button", { name: "Für alle löschen" }).click();
    await gA.membersDialog.getByRole("alert").getByRole("button", { name: "Für alle löschen" }).click();
    await expect(gA.entry(title)).toHaveCount(0);
    await expect(gA.composer).toHaveAttribute("placeholder", "Frag Freebie etwas …");
    await expect(chatC.page.getByRole("status").filter({ hasText: "Diesen Gruppenchat gibt es nicht mehr." })).toBeVisible({ timeout: 20_000 });
    await expect(gC.entry(title)).toHaveCount(0);
    await expect(gC.composer).toHaveAttribute("placeholder", "Frag Freebie etwas …");
    expect((await chatB.page.request.get(`/api/groupchats/${id}`)).status()).toBe(404);
  });
});

/** Einladen über die API (als startende Person). */
async function startInvite(chat: ChatPage, id: string, people: string[]) {
  const res = await chat.page.request.put(`/api/groupchats/${id}`, { data: { invite: people } });
  expect(res.status(), await res.text()).toBe(200);
}

test.describe("GC · Gruppenchats: Kursleitung, Anhänge, Abmelden, Export", () => {
  test("GC09 Kursleitung führt vor: Auswahl „Gruppe“, nur Personen dieser Gruppe; Abmelden lässt ihre Gruppenchats bestehen", async ({ browser, baseURL, ip, admin }) => {
    const { guests, others, eventName } = await mailGroup(admin, 2, 1);
    const [a, b] = guests;
    const teacher = await openChat(browser, baseURL!, ip, { guest: ADMIN });
    const g = GroupChatPage.of(teacher);
    await g.newButton.click();
    const d = g.dialog;
    const select = d.getByRole("combobox", { name: "Gruppe" });
    await expect(select).toBeVisible();
    await select.selectOption({ label: `${eventName} · Gruppe B` });
    await expect(d.getByRole("group", { name: "Personen" }).getByRole("checkbox")).toHaveCount(1);
    await select.selectOption({ label: `${eventName} · Gruppe A` });
    await expect(d.getByRole("group", { name: "Personen" }).getByRole("checkbox")).toHaveCount(2);
    await d.getByRole("button", { name: "Abbrechen" }).click();
    const title = `Vorführung ${uniq()}`;
    await g.start(title, [a.username, b.username], `${eventName} · Gruppe A`);
    await expect(g.notes.filter({ hasText: `Du hast ${a.username} und ${b.username} eingeladen` })).toBeVisible();
    await g.post("@Freebie zeig, wie du zusammenfasst");
    await g.waitForAnswer(1);

    // Personen aus zwei Gruppen: Meldung, nichts angelegt.
    const groups = (await (await teacher.page.request.get("/api/groupchats/members")).json()) as { groups: { id: string; name: string; eventName: string }[] };
    const groupA = groups.groups.find((x) => x.eventName === eventName && x.name === "Gruppe A")!;
    const mixed = await teacher.page.request.post("/api/groupchats", { data: { title: "Gemischt", members: [a.username, others[0].username], groupId: groupA.id } });
    expect(mixed.status()).toBe(400);
    expect(((await mixed.json()) as { error: string }).error).toBe(`„${others[0].username}“ kann nicht eingeladen werden. Ein Gruppenchat enthält nur Personen aus einer Gruppe.`);
    expect((await groupChatsOf(teacher.page.request)).filter((x) => x.title === "Gemischt")).toEqual([]);

    // Gäste können die Kursleitung nicht einladen.
    const apiA = await guestApi(baseURL!, ip, a);
    const withTeacher = await apiA.post("/api/groupchats", { data: { title: "Mit Kursleitung", members: ["kursleitung"] } });
    expect(withTeacher.status()).toBe(400);
    expect(((await withTeacher.json()) as { error: string }).error).toBe("„kursleitung“ kann nicht eingeladen werden. Gruppenchats sind für die Teilnehmenden einer Gruppe.");
    const chatOfA = (await groupChatsOf(apiA)).find((x) => x.title === title)!;
    expect(chatOfA).toMatchObject({ owner: "kursleitung", mine: false, members: 3 });

    // Abmelden der Kursleitung: der Gruppenchat bleibt.
    teacher.page.once("dialog", (dialog) => void dialog.accept());
    await teacher.page.getByRole("button", { name: "Abmelden" }).click();
    await expect(teacher.page).toHaveURL(/\/login$/);
    const after = await groupChatOf(apiA, chatOfA.id);
    expect(after.messages.filter((m) => m.kind === "freebie")).toHaveLength(1);
    await apiA.dispose();
  });

  test("GC11 Anhänge und Artefakte sehen alle; „Verbindungen“ und „Bild-Modus“ gibt es im Gruppenchat nicht", async ({ browser, baseURL, ip, admin }) => {
    const { b, chatA, chatB, gA, gB } = await trio(admin, browser, baseURL!, ip);
    const title = `Dateien ${uniq()}`;
    await startGroupChat(chatA.page.request, title, [b.username]);
    await chatA.page.reload();
    await chatB.page.reload();
    await gA.open(title);
    await gB.open(title);
    await expect(chatA.page.getByRole("button", { name: /^Verbindungen/ })).toHaveCount(0);
    await expect(chatA.page.getByRole("button", { name: /Bild-Modus|Bild erstellen/ })).toHaveCount(0);

    // Die Eingabe des (versteckten) privaten Chats liegt auch im Dokument – die des Gruppenchats nehmen.
    await chatA.page.locator("main:not([hidden])").getByLabel("Dateien zum Anhängen").setInputFiles(freshPayload("notiz.txt"));
    await expectReady(chatA.page, "notiz.txt", /Token/);
    await gA.composer.fill("Hier die Notiz");
    await gA.sendButton.click();
    await expect(gB.from(chatA.guest!.username)).toContainText("notiz.txt");
    await gB.composer.fill("@Freebie was steht in der Notiz? #zeige-dateien");
    await gB.sendButton.click();
    await gB.waitForAnswer(1);
    await expect(gB.answers.last()).toContainText("LEUCHTTURM");
    await gA.waitForAnswer(1);

    // Artefakt: bei der fragenden Person öffnet es sich, die anderen sehen den Knopf.
    await gB.composer.fill("@Freebie #svg");
    await gB.sendButton.click();
    await gB.waitForAnswer(2);
    await expect(chatB.page.getByRole("button", { name: "Artefakte (1)" })).toBeVisible();
    await gA.waitForAnswer(2);
    const artifacts = chatA.page.getByRole("button", { name: "Artefakte (1)" });
    await expect(artifacts).toBeVisible();
    await artifacts.click();
    await expect(chatA.page.locator("iframe").first()).toBeVisible();
  });

  test("GC13 Abmelden: Rückfrage nennt die Gruppenchats; nach erneuter Anmeldung sind sie wieder da, der nächste Gast am Gerät sieht sie nicht", async ({ browser, baseURL, ip, admin }) => {
    const { a, b, c, chatA } = await trio(admin, browser, baseURL!, ip);
    const title = `Bleibt ${uniq()}`;
    const { id } = await startGroupChat(chatA.page.request, title, [b.username]);
    await postMessage(chatA.page.request, id, "Notiz vor dem Abmelden");
    await chatA.page.reload();
    const gA = GroupChatPage.of(chatA);
    await expect(gA.entry(title)).toBeVisible();

    chatA.page.once("dialog", (dialog) => {
      expect(dialog.message()).toBe(
        "Beim Abmelden werden deine Chats von diesem Gerät gelöscht und dein Posteingang wird geleert. Wenn du Chats behalten möchtest, vorher „Export“ wählen. Deine Gruppenchats bleiben für deine Gruppe bis zum Termin-Ende bestehen. Jetzt abmelden?",
      );
      void dialog.accept();
    });
    await chatA.page.getByRole("button", { name: "Abmelden" }).click();
    await expect(chatA.page).toHaveURL(/\/login$/);

    // C meldet sich am selben Gerät an: nichts von A.
    await loginUser(chatA.page, { guest: c });
    await chatA.page.goto("/");
    await expect(new ChatPage(chatA.page).composer).toBeVisible();
    await expect(gA.entry(title)).toHaveCount(0);
    await expect(chatA.page.getByText("Notiz vor dem Abmelden")).toHaveCount(0);

    // A in einem neuen Browser: der Gruppenchat ist wieder da.
    const again = await openChat(browser, baseURL!, ipFor(`${ip}-neu`), { guest: a });
    const g2 = GroupChatPage.of(again);
    await g2.open(title);
    await expect(g2.mine).toContainText("Notiz vor dem Abmelden");
  });

  test("GC15 Export nimmt die Gruppenchats mit; Import ergibt private Chats mit Autoren; Markdown nennt die Autoren", async ({ browser, baseURL, ip, admin }, testInfo) => {
    const { a, b, chatA, chatB, gA } = await trio(admin, browser, baseURL!, ip);
    const title = `Export ${uniq()}`;
    const { id } = await startGroupChat(chatA.page.request, title, [b.username]);
    await postMessage(chatA.page.request, id, "Notiz von A");
    await postMessage(chatB.page.request, id, "Notiz von B");
    await chatA.page.reload();
    await gA.open(title);
    await expect(gA.from(b.username)).toBeVisible();

    // Markdown-Export des Gruppenchats.
    const md = chatA.page.waitForEvent("download");
    await chatA.page.getByRole("button", { name: "Chat als Markdown exportieren" }).click();
    const mdPath = testInfo.outputPath("gruppenchat.md");
    await (await md).saveAs(mdPath);
    const markdown = readFileSync(mdPath, "utf8");
    expect(markdown).toContain(`## ${a.username}`);
    expect(markdown).toContain(`## ${b.username}`);
    expect(markdown).toContain("Notiz von B");

    // „Export“ in der Seitenleiste.
    const download = chatA.page.waitForEvent("download");
    await chatA.page.getByRole("button", { name: "Alle Chats exportieren" }).click();
    const path = testInfo.outputPath("export.json");
    await (await download).saveAs(path);
    const data = JSON.parse(readFileSync(path, "utf8")) as { conversations: { id: string; title: string; messages: { author?: string; text: string }[] }[] };
    const exported = data.conversations.find((c) => c.id === `gruppenchat-${id}`)!;
    expect(exported.title).toBe(`${title} (Gruppenchat)`);
    expect(exported.messages.map((m) => [m.author, m.text])).toEqual([
      [a.username, "Notiz von A"],
      [b.username, "Notiz von B"],
    ]);

    // Import bei B: ein privater Chat mit Autoren.
    const imported = chatB.page.waitForEvent("dialog");
    // Als Inhalt übergeben: Pfade mit Sonderzeichen (aus dem Testtitel) kommen sonst nicht im Browser an.
    await chatB.page.getByLabel("Export-Datei für den Import").setInputFiles({ name: "import.json", mimeType: "application/json", buffer: readFileSync(path) });
    const dialog = await imported;
    expect(dialog.message()).toBe("1 Chat importiert.");
    await dialog.accept();
    await chatB.page.getByRole("navigation", { name: "Chatverlauf" }).getByRole("button", { name: `${title} (Gruppenchat)`, exact: true }).click();
    await expect(chatB.page.getByRole("article", { name: `Nachricht von ${a.username}` })).toContainText("Notiz von A");
    await expect(chatB.page.getByRole("article", { name: `Nachricht von ${b.username}` })).toContainText("Notiz von B");
  });
});

test.describe("GC · Gruppenchats auf Handy und Tablet, Barrierefreiheit, Abfrage", () => {
  test("GC16 Handy: Abschnitt in der Leiste, Dialoge im Vollbild, Personen-Knopf, Vorschläge erreichbar, Hinweis passt auf den Bildschirm @mobil", async ({ admin, page, browser, baseURL, ip }) => {
    const { guests } = await mailGroup(admin, 2);
    const [a, b] = guests;
    await loginUser(page, { guest: b });
    await page.clock.install();
    const chatB = new ChatPage(page);
    await chatB.open();
    const g = new GroupChatPage(page);

    // Lange Einladung: der Hinweis bricht um und bleibt im Bild.
    const apiA = await guestApi(baseURL!, ip, a);
    const title = `Protokoll der Teamrunde zur Raumplanung im Herbst ${uniq()}`;
    const { id } = await startGroupChat(apiA, title, [b.username]);
    await postMessage(apiA, id, "Erste Notiz");
    await page.clock.fastForward("00:16");
    const toast = page.getByRole("status").filter({ hasText: `${a.username} hat dich in „${title}“ eingeladen` });
    await expect(toast).toBeVisible();
    const box = (await toast.boundingBox())!;
    const width = page.viewportSize()!.width;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    expect(box.height).toBeGreaterThan(40);
    await expect(toast.getByRole("button", { name: "Öffnen" })).toBeInViewport();
    await toast.getByRole("button", { name: "Öffnen" }).click();
    await expect(g.heading).toHaveText(title);
    await expect(g.membersButton).toBeVisible();
    await expect(g.membersButton).toHaveAccessibleName("Mitglieder (2)");

    // Vorschläge über der Tastatur erreichbar.
    await g.composer.fill("@");
    const list = page.getByRole("listbox", { name: "Vorschläge" });
    await expect(list).toBeInViewport();
    await list.getByRole("option", { name: /@Freebie/ }).click();
    await expect(g.composer).toHaveValue("@Freebie ");

    // Mitglieder-Dialog im Vollbild.
    await g.membersButton.click();
    expect((await g.membersDialog.boundingBox())!.width).toBeGreaterThan(width - 20);
    await g.membersDialog.getByRole("button", { name: "Schließen" }).click();

    // Leiste: Abschnitt „Gruppenchats“ und Symbol; Start-Dialog im Vollbild.
    await page.getByRole("button", { name: "Menü öffnen" }).click();
    await expect(g.entry(title)).toBeInViewport();
    await expect(g.newButton).toBeInViewport();
    await g.newButton.click();
    expect((await g.dialog.boundingBox())!.width).toBeGreaterThan(width - 20);
    await g.dialog.getByRole("button", { name: "Abbrechen" }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await apiA.dispose();
    void browser;
  });

  test("GC16 Tablet: Abschnitt in der Leiste, Kopfzeile mit Avataren, Eingabe erreichbar @tablet", async ({ admin, page }) => {
    const { guests } = await mailGroup(admin, 2);
    const [a, b] = guests;
    await loginUser(page, { guest: a });
    const chat = new ChatPage(page);
    await chat.open();
    const g = new GroupChatPage(page);
    const title = `Tablet ${uniq()}`;
    await g.start(title, [b.username]);
    await expect(g.entry(title)).toBeInViewport();
    await expect(g.membersButton).toBeInViewport();
    await g.post("Notiz auf dem Tablet");
    await expect(g.composer).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`GC17 Start- und Mitglieder-Dialog, Vorschläge und Gruppenchat sind barrierearm (${scheme === "light" ? "hell" : "dunkel"})`, async ({ browser, baseURL, ip, admin }, testInfo) => {
      const { b, chatA, chatB, gA } = await trio(admin, browser, baseURL!, ip);
      await chatA.page.emulateMedia({ colorScheme: scheme });
      await gA.newButton.click();
      await gA.dialog.getByRole("textbox", { name: "Name" }).fill("Barrierefrei");
      await gA.dialog.getByRole("checkbox", { name: b.username }).check();
      await expectAccessible(chatA.page, testInfo, `gruppenchat-start-${scheme}`);
      // Esc schließt den Dialog, der Fokus kehrt zum Symbol zurück.
      await chatA.page.keyboard.press("Escape");
      await expect(gA.dialog).toBeHidden();
      await expect(gA.newButton).toBeFocused();
      await gA.start("Barrierefrei", [b.username]);
      const { id } = (await groupChatsOf(chatA.page.request))[0];
      await postMessage(chatB.page.request, id, "Notiz von B für die Prüfung");
      await gA.post("@Freebie fasse zusammen");
      await gA.waitForAnswer(1);
      await expect(gA.from(b.username)).toBeVisible();
      await expectAccessible(chatA.page, testInfo, `gruppenchat-${scheme}`);
      await gA.composer.fill("@");
      await expect(chatA.page.getByRole("listbox", { name: "Vorschläge" })).toBeVisible();
      await expectAccessible(chatA.page, testInfo, `gruppenchat-vorschlaege-${scheme}`);
      await gA.composer.press("Escape");
      await expect(chatA.page.getByRole("listbox", { name: "Vorschläge" })).toBeHidden();
      await gA.membersButton.click();
      await expectAccessible(chatA.page, testInfo, `gruppenchat-mitglieder-${scheme}`);
      await chatA.page.keyboard.press("Escape");
      await expect(gA.membersDialog).toBeHidden();
      await expect(gA.membersButton).toBeFocused();
    });
  }

  test("GC19 Neues: Punkt verschwindet beim Öffnen, eigene Beiträge zählen nicht, Hinweis nur bei Einladungen; Abfrage nur bei sichtbarem Tab, langsamer bei Ruhe", async ({ browser, baseURL, ip, admin }) => {
    const { b, chatA, chatB, gA, gB } = await trio(admin, browser, baseURL!, ip, { clockB: true });
    const title = `Neues ${uniq()}`;
    const { id } = await startGroupChat(chatA.page.request, title, [b.username]);
    await chatB.page.clock.fastForward("00:16");
    const invite = chatB.page.getByRole("status").filter({ hasText: "hat dich in" });
    await expect(invite).toBeVisible();
    await expect(gB.entry(title)).toHaveAccessibleName(`${title}, neue Nachrichten`);

    // Ein Beitrag in einem bekannten Chat ist keine Einladung: Punkt ja, Hinweis nein.
    await postMessage(chatA.page.request, id, "Neuer Beitrag");
    await chatB.page.clock.fastForward("00:16");
    await expect(gB.entry(title)).toHaveAccessibleName(`${title}, neue Nachrichten`);
    await expect(chatB.page.getByRole("status").filter({ hasText: "hat dich in" })).toHaveCount(0);
    await gB.entry(title).click();
    await expect(gB.heading).toHaveText(title);
    await expect(gB.entry(title)).toHaveAccessibleName(title);

    // Eigene Beiträge zählen nicht als neu.
    await postMessage(chatA.page.request, id, "Eigener Beitrag");
    await chatA.page.reload();
    await expect(gA.entry(title)).toHaveAccessibleName(title);

    // Abfrage im offenen Chat: alle 4 Sekunden, nach 2 Minuten Ruhe alle 10, bei verstecktem Tab gar nicht.
    const polls: string[] = [];
    chatB.page.on("request", (r) => {
      if (r.url().includes(`/api/groupchats/${id}?since=`)) polls.push(r.url());
    });
    const tick = async (ms: number, expected: number) => {
      await chatB.page.clock.fastForward(ms);
      await expect.poll(() => polls.length).toBe(expected);
    };
    await tick(4_000, 1);
    await tick(4_000, 2);
    await chatB.page.clock.fastForward("02:05");
    await expect.poll(() => polls.length).toBe(3);
    await chatB.page.clock.fastForward(4_000);
    await chatB.page.waitForTimeout(500);
    expect(polls).toHaveLength(3);
    await tick(6_500, 4);
    await chatB.page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    for (let i = 0; i < 3; i++) await chatB.page.clock.fastForward(11_000);
    await chatB.page.waitForTimeout(500);
    expect(polls).toHaveLength(4);
    await chatB.page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "visible" });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await expect.poll(() => polls.length).toBe(5);
  });
});
