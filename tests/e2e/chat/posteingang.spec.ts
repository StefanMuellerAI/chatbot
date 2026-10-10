import { readFileSync } from "node:fs";
import { expectAccessible } from "../support/a11y";
import { ChatPage, expect, ipFor, loginUser, openChat, test, uniq } from "../support/fixtures";
import { address, guestApi, inboxOf, MailPage, mailGroup, sendMail, setConnection } from "../support/mail";

// Z · Posteingang und Verbindung „Posteingang“ im Chat (Plan: POSTEINGANG-PLAN.md).
// Jeder Test hat einen eigenen Termin; Mails gehen nur innerhalb der Gruppe und an die Kursleitung.

const re = (text: string) => new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
const WELCOME = "Willkommen in deinem Posteingang";

test.describe("Z · Posteingang", () => {
  test("Z01 Posteingang über den Umschalter: Ordner, eigene Adresse, Begrüßung; bleibt nach dem Neuladen, eine laufende Antwort läuft weiter", async ({ browser, baseURL, ip, admin }) => {
    const { guests } = await mailGroup(admin, 1);
    const chat = await openChat(browser, baseURL!, ip, { guest: guests[0] });
    const mail = MailPage.of(chat);
    await expect(mail.postTab).toHaveAccessibleName("Posteingang, 1 ungelesen");

    // Eine langsame Antwort läuft weiter, während der Posteingang offen ist.
    await chat.send(`#langsam Erzähl mir etwas ${uniq()}`);
    await expect(chat.stopButton).toBeVisible();
    await mail.open();
    await expect(mail.folder("Posteingang")).toHaveAttribute("aria-current", "page");
    await expect(mail.folder("Posteingang")).toHaveAccessibleName("Posteingang, 1 ungelesen");
    await expect(mail.folder("Gesendet")).toBeVisible();
    await expect(chat.page.getByText(address(guests[0]), { exact: true })).toBeVisible();
    await expect(chat.page.getByText("Du kannst deiner Gruppe „Gruppe A“ und der Kursleitung schreiben.")).toBeVisible();
    await expect(chat.page.getByRole("note").filter({ hasText: "Übungs-Postfach" })).toBeVisible();
    await expect(mail.row(new RegExp(`^Ungelesen: Kursleitung, ${WELCOME}`))).toBeVisible();
    await mail.chatTab.click();
    await expect(chat.page).toHaveURL(/\/$/);
    await chat.waitForAnswer(1);
    await expect(chat.lastAnswer).toContainText("Testmodus");
    await expect(chat.lastAnswer).not.toContainText("Abgebrochen");

    await mail.open();
    await chat.page.reload();
    await expect(chat.page.getByRole("heading", { name: "Posteingang", level: 1 })).toBeVisible();
    await expect(mail.postTab).toHaveAttribute("aria-pressed", "true");
  });

  test("Z01 „Adresse kopieren“ legt die eigene Adresse in die Zwischenablage @nur-chromium", async ({ browser, baseURL, ip, admin }) => {
    const { guests } = await mailGroup(admin, 1);
    const chat = await openChat(browser, baseURL!, ip, { guest: guests[0] });
    await chat.page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await MailPage.of(chat).open();
    await chat.page.getByRole("button", { name: "Adresse kopieren" }).click();
    await expect(chat.page.getByRole("button", { name: "Kopiert" })).toBeVisible();
    expect(await chat.page.evaluate(() => navigator.clipboard.readText())).toBe(address(guests[0]));
    await expect(chat.page.getByRole("button", { name: "Adresse kopieren" })).toBeVisible();
  });

  test("Z02 A schreibt B: B sieht die Mail ohne Neuladen mit Hinweis im Chat; A hat sie unter „Gesendet“", async ({ browser, baseURL, ip, admin }) => {
    const {
      guests: [a, b],
    } = await mailGroup(admin, 2);
    const chatB = await openChat(browser, baseURL!, ipFor(`${ip}-b`), { guest: b });
    // Die Abfrage läuft alle 15 Sekunden – die Uhr im Browser spult der Test vor.
    await chatB.page.clock.install();
    await chatB.open();
    const chatA = await openChat(browser, baseURL!, ip, { guest: a });
    const mailA = MailPage.of(chatA);
    const subject = `Raum am Dienstag ${uniq()}`;
    await mailA.open();
    await mailA.compose([b.username], subject, "Hallo,\nsollen wir zusagen?\n\nGruß");
    await expect(chatA.page.getByRole("status").filter({ hasText: `E-Mail an ${b.username} gesendet.` })).toBeVisible();
    await mailA.folder("Gesendet").click();
    await expect(mailA.row(re(subject))).toContainText(`An: ${b.username}`);

    const mailB = MailPage.of(chatB);
    await chatB.page.clock.fastForward("00:16");
    const toast = chatB.page.getByRole("status").filter({ hasText: `Neue E-Mail von ${a.username}: „${subject}“` });
    await expect(toast).toBeVisible();
    await expect(mailB.postTab).toHaveAccessibleName("Posteingang, 2 ungelesen");
    await toast.getByRole("button", { name: "Öffnen" }).click();
    await expect(mailB.reader.getByRole("heading", { name: subject })).toBeVisible();
    await expect(mailB.reader).toContainText(`${a.username} <${address(a)}>`);
    await expect(mailB.reader).toContainText("an mich");
    await expect(mailB.reader).toContainText("sollen wir zusagen?");
    await expect(mailB.postTab).toHaveAccessibleName("Posteingang, 1 ungelesen");
  });

  test("Z03 Lesen, „Als ungelesen markieren“, Löschen (abbrechen/bestätigen) – nur die eigene Kopie", async ({ browser, baseURL, ip, admin }) => {
    const {
      guests: [a, b],
    } = await mailGroup(admin, 2);
    const chatA = await openChat(browser, baseURL!, ipFor(`${ip}-a`), { guest: a });
    const chatB = await openChat(browser, baseURL!, ip, { guest: b });
    const subject = `Protokoll ${uniq()}`;
    await sendMail(chatA.page.request, { to: [b.username], subject, body: "Punkt 1" });
    const mail = MailPage.of(chatB);
    await mail.open();
    await expect(mail.row(new RegExp(`^Ungelesen: ${a.username}, ${subject}`))).toBeVisible();
    await expect(chatB.page.getByText("2 ungelesen")).toBeVisible();
    await mail.row(re(subject)).click();
    await expect(mail.reader.getByRole("heading", { name: subject })).toBeVisible();
    await expect(mail.row(new RegExp(`^${a.username}, ${subject}`))).toBeVisible();
    await expect(chatB.page.getByText("1 ungelesen")).toBeVisible();

    const toolbar = mail.reader.getByRole("toolbar", { name: "Aktionen für diese E-Mail" });
    await toolbar.getByRole("button", { name: "Als ungelesen markieren" }).click();
    await expect(toolbar.getByRole("button", { name: "Als gelesen markieren" })).toBeVisible();
    await expect(mail.postTab).toHaveAccessibleName("Posteingang, 2 ungelesen");
    await toolbar.getByRole("button", { name: "Als gelesen markieren" }).click();
    await expect(mail.postTab).toHaveAccessibleName("Posteingang, 1 ungelesen");

    const confirm = mail.reader.getByRole("alert").filter({ hasText: "Diese E-Mail löschen?" });
    await toolbar.getByRole("button", { name: "Löschen" }).click();
    await confirm.getByRole("button", { name: "Abbrechen" }).click();
    await expect(confirm).toBeHidden();
    await expect(mail.row(re(subject))).toBeVisible();
    await toolbar.getByRole("button", { name: "Löschen" }).click();
    await confirm.getByRole("button", { name: "Löschen" }).click();
    await expect(mail.row(re(subject))).toHaveCount(0);
    await expect(chatB.page.getByRole("status").filter({ hasText: "E-Mail gelöscht." })).toBeVisible();
    // Die ältere Mail rückt nach – das ist keine neue Mail.
    await expect(chatB.page.getByText(/^Neue E-Mail von/)).toHaveCount(0);
    // Bei der Absenderin bleibt die Mail.
    expect((await inboxOf(chatA.page.request, "sent")).mails.map((m) => m.subject)).toContain(subject);
  });

  test("Z04 Antworten, Allen antworten und Weiterleiten füllen Empfänger, „AW:“/„WG:“ und das Zitat vor", async ({ browser, baseURL, ip, admin }) => {
    const {
      guests: [a, b, c],
    } = await mailGroup(admin, 3);
    const chatA = await openChat(browser, baseURL!, ipFor(`${ip}-a`), { guest: a });
    const chatB = await openChat(browser, baseURL!, ip, { guest: b });
    const subject = `Angebot ${uniq()}`;
    await sendMail(chatA.page.request, { to: [b.username], cc: [c.username], subject, body: "Raum Rhein für 890 €." });
    const mail = MailPage.of(chatB);
    await mail.open();
    await mail.row(re(subject)).click();
    await expect(mail.reader).toContainText(`Cc ${c.username}`);
    const toolbar = mail.reader.getByRole("toolbar", { name: "Aktionen für diese E-Mail" });

    await toolbar.getByRole("button", { name: "Antworten", exact: true }).click();
    let d = mail.dialog("Antworten");
    await expect(d.getByRole("button", { name: `${a.username} entfernen` })).toBeVisible();
    await expect(d.getByRole("textbox", { name: "Betreff" })).toHaveValue(`AW: ${subject}`);
    await expect(d.getByRole("textbox", { name: "Text der E-Mail" })).toHaveValue(new RegExp(`^\\n\\n> Am .* schrieb ${a.username}:\\n> Raum Rhein für 890 €\\.$`));
    await expect(d.getByRole("textbox", { name: "Text der E-Mail" })).toBeFocused();
    await d.getByRole("button", { name: "Schließen" }).click();
    await expect(d).toBeHidden();

    await toolbar.getByRole("button", { name: "Allen antworten" }).click();
    d = mail.dialog("Allen antworten");
    await expect(d.getByRole("button", { name: `${a.username} entfernen` })).toBeVisible();
    await expect(d.getByRole("textbox", { name: "Cc", exact: true })).toBeVisible();
    await expect(d.getByRole("button", { name: `${c.username} entfernen` })).toBeVisible();
    await expect(d.getByRole("button", { name: `${b.username} entfernen` })).toHaveCount(0);
    await d.getByRole("button", { name: "Schließen" }).click();

    await toolbar.getByRole("button", { name: "Weiterleiten" }).click();
    d = mail.dialog("Weiterleiten");
    await expect(d.getByRole("textbox", { name: "Betreff" })).toHaveValue(`WG: ${subject}`);
    await expect(d.getByRole("textbox", { name: "Text der E-Mail" })).toHaveValue(/-------- Weitergeleitete Nachricht --------/);
    await expect(d.getByRole("textbox", { name: "An", exact: true })).toBeFocused();
    await mail.addRecipient(c.username, "An", "Weiterleiten");
    await d.getByRole("button", { name: "Senden" }).click();
    await expect(d).toBeHidden();
    const forwarded = (await inboxOf(await guestApi(baseURL!, ip, c))).mails.find((m) => m.subject === `WG: ${subject}`);
    expect(forwarded?.from).toBe(b.username);
  });

  test("Z05 Schreiben: Adressbuch nur mit eigener Gruppe und Kursleitung, Prüfungen, Verwerfen und Strg+Enter", async ({ browser, baseURL, ip, admin }) => {
    const {
      guests: [a, b, c],
      others: [x],
    } = await mailGroup(admin, 3, 1);
    const chat = await openChat(browser, baseURL!, ip, { guest: a });
    const mail = MailPage.of(chat);
    await mail.open();
    await mail.newMail.click();
    const d = mail.dialog();
    const to = d.getByRole("textbox", { name: "An", exact: true });
    await expect(to).toBeFocused();
    await expect(d).toContainText(`Von${a.username} <${address(a)}>`);

    // Vorschläge beim Tippen
    await to.fill(b.username.slice(0, 4));
    const book = d.getByRole("list", { name: "Adressbuch für „An“" });
    await book.getByRole("button", { name: new RegExp(`^${b.username}`) }).click();
    await expect(d.getByRole("button", { name: `${b.username} entfernen` })).toBeVisible();
    await d.getByRole("button", { name: `${b.username} entfernen` }).click();

    // Das Adressbuch zeigt nur die eigene Gruppe und die Kursleitung.
    await d.getByRole("button", { name: "Adressbuch" }).first().click();
    await expect(book.getByRole("button")).toHaveCount(4);
    await expect(book).toContainText("Alle in meiner Gruppe");
    await expect(book).toContainText("Kursleitung");
    await expect(book).not.toContainText(x.username);
    await expect(book).not.toContainText(`${a.username}@`);
    await book.getByRole("button", { name: /^Alle in meiner Gruppe/ }).click();
    await expect(d.getByRole("button", { name: `${b.username} entfernen` })).toBeVisible();
    await expect(d.getByRole("button", { name: `${c.username} entfernen` })).toBeVisible();

    // Fremde Gruppe und unbekannte Adressen werden sofort gemeldet.
    await mail.addRecipient(x.username);
    await expect(d.getByRole("alert")).toHaveText(`„${address(x)}“ kann nicht zugestellt werden. Du kannst nur deiner Gruppe und der Kursleitung schreiben.`);
    await mail.addRecipient("jemand@gmail.com");
    await expect(d.getByRole("alert")).toHaveText("„jemand@gmail.com“ ist keine Adresse in Freebie (…@freebie.example).");
    await to.fill("");

    // Cc, an sich selbst und an die Kursleitung
    await d.getByRole("button", { name: "Cc", exact: true }).click();
    await mail.addRecipient("Kursleitung", "Cc");
    await mail.addRecipient(a.username);
    await expect(d.getByRole("button", { name: "Kursleitung entfernen" })).toBeVisible();
    await expect(d.getByRole("button", { name: `${a.username} entfernen` })).toBeVisible();
    const subject = `Rundmail ${uniq()}`;
    await d.getByRole("textbox", { name: "Betreff" }).fill(subject);
    // Enter im Betreff springt in den Text, statt zu senden.
    await d.getByRole("textbox", { name: "Betreff" }).press("Enter");
    await expect(d.getByRole("textbox", { name: "Text der E-Mail" })).toBeFocused();
    await d.getByRole("textbox", { name: "Text der E-Mail" }).fill("Hallo alle!");
    await d.getByRole("textbox", { name: "Text der E-Mail" }).press("Control+Enter");
    await expect(d).toBeHidden();
    const sent = (await inboxOf(chat.page.request, "sent")).mails.find((m) => m.subject === subject)!;
    expect(sent.to.sort()).toEqual([a.username, b.username, c.username].sort());
    expect((await inboxOf(chat.page.request)).mails.map((m) => m.subject)).toContain(subject);

    // Ohne Empfänger: Meldung, nichts verschickt.
    await mail.newMail.click();
    await d.getByRole("textbox", { name: "Betreff" }).fill("Ohne Empfänger");
    await d.getByRole("button", { name: "Senden" }).click();
    await expect(d.getByRole("alert")).toHaveText("Bitte gib mindestens einen Empfänger an.");

    // Verwerfen fragt nach, wenn schon etwas geschrieben ist (Esc, X oder „Verwerfen“).
    await chat.page.keyboard.press("Escape");
    const discard = d.getByRole("alert").filter({ hasText: "Entwurf verwerfen?" });
    await expect(discard).toBeVisible();
    await discard.getByRole("button", { name: "Weiter schreiben" }).click();
    await expect(discard).toBeHidden();
    await expect(d).toBeVisible();
    await d.getByRole("button", { name: "Verwerfen" }).last().click();
    await discard.getByRole("button", { name: "Verwerfen" }).click();
    await expect(d).toBeHidden();
    expect((await inboxOf(chat.page.request, "sent")).mails.map((m) => m.subject)).not.toContain("Ohne Empfänger");
  });

  test("Z06 Suche und Ordner", async ({ browser, baseURL, ip, admin }) => {
    const {
      guests: [a, b],
    } = await mailGroup(admin, 2);
    const chatA = await openChat(browser, baseURL!, ipFor(`${ip}-a`), { guest: a });
    const tag = uniq();
    await sendMail(chatA.page.request, { to: [b.username], subject: `Angebot ${tag}`, body: "Raum Rhein" });
    await sendMail(chatA.page.request, { to: [b.username], subject: `Mittag ${tag}`, body: "Kantine um 12:30" });
    const chatB = await openChat(browser, baseURL!, ip, { guest: b });
    const mail = MailPage.of(chatB);
    await mail.open();
    const search = chatB.page.getByRole("searchbox", { name: "E-Mails durchsuchen" });
    await search.fill("kantine");
    await expect(mail.rows).toHaveCount(1);
    await expect(mail.rows.first()).toContainText(`Mittag ${tag}`);
    await search.fill(a.username);
    await expect(mail.rows).toHaveCount(2);
    await search.fill("gibt es nicht");
    await expect(mail.rows).toHaveCount(0);
    await expect(chatB.page.getByText("Keine Treffer.")).toBeVisible();
    await search.fill("");
    await expect(mail.rows).toHaveCount(3);

    await mail.folder("Gesendet").click();
    await expect(chatB.page.getByText("Du hast noch nichts gesendet.")).toBeVisible();
    const mailA = MailPage.of(chatA);
    await mailA.open();
    await mailA.folder("Gesendet").click();
    await expect(chatA.page.getByRole("heading", { name: "Gesendet", level: 1 })).toBeVisible();
    await expect(chatA.page.getByText("2 E-Mails")).toBeVisible();
    await expect(mailA.rows.first()).toContainText(`An: ${b.username}`);
  });

  test("Z07 Darstellung: HTML und Skripte als Text, Zitate, Umlaute, Emoji und Zeitangaben", async ({ browser, baseURL, ip, admin }) => {
    const {
      guests: [a, b],
    } = await mailGroup(admin, 2);
    const chatA = await openChat(browser, baseURL!, ipFor(`${ip}-a`), { guest: a });
    const subject = `<b>Fett</b> & <script>window.__xss=1</script> ${uniq()}`;
    const body = 'Grüße aus Köln 😀\n<img src="x" onerror="window.__xss=2">\n**kein Markdown**\n\n> Zitat aus der letzten Mail\n> zweite Zeile';
    await sendMail(chatA.page.request, { to: [b.username], subject, body });
    const chatB = await openChat(browser, baseURL!, ip, { guest: b });
    const mail = MailPage.of(chatB);
    await mail.open();
    await expect(mail.rows.first()).toContainText(/\d{2}:\d{2}/);
    await mail.row(/Fett/).click();
    await expect(mail.reader.getByRole("heading", { level: 2 })).toHaveText(subject);
    await expect(mail.reader).toContainText('<img src="x" onerror="window.__xss=2">');
    await expect(mail.reader).toContainText("Grüße aus Köln 😀");
    await expect(mail.reader).toContainText("**kein Markdown**");
    await expect(mail.reader.locator("blockquote")).toHaveText("Zitat aus der letzten Mail\nzweite Zeile");
    await expect(mail.reader).toContainText(/\w{2}\., \d{2}\.\d{2}\.\d{4}, \d{2}:\d{2}/);
    expect(await chatB.page.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBeUndefined();
  });

  test("Z08 Abmelden leert den Posteingang; Mails an andere bleiben bei ihnen", async ({ browser, baseURL, ip, admin }) => {
    const {
      guests: [a, b],
    } = await mailGroup(admin, 2);
    const chatA = await openChat(browser, baseURL!, ip, { guest: a });
    const chatB = await openChat(browser, baseURL!, ipFor(`${ip}-b`), { guest: b });
    const subject = `Bleibt bei B ${uniq()}`;
    await sendMail(chatA.page.request, { to: [b.username], subject });
    await sendMail(chatB.page.request, { to: [a.username], subject: `Antwort ${uniq()}` });
    expect((await inboxOf(chatA.page.request)).total).toBe(2);

    chatA.page.once("dialog", (dialog) => {
      expect(dialog.message()).toBe(
        "Beim Abmelden werden deine Chats von diesem Gerät gelöscht und dein Posteingang wird geleert. Wenn du Chats behalten möchtest, vorher „Export“ wählen. Jetzt abmelden?",
      );
      void dialog.accept();
    });
    await chatA.page.getByRole("button", { name: "Abmelden" }).click();
    await expect(chatA.page).toHaveURL(/\/login$/);
    expect((await inboxOf(chatB.page.request)).mails.map((m) => m.subject)).toContain(subject);

    // Neue Anmeldung: nur die Begrüßung, „Gesendet“ ist leer.
    const again = await guestApi(baseURL!, ip, a);
    expect((await inboxOf(again)).mails.map((m) => m.subject)).toEqual([WELCOME]);
    expect((await inboxOf(again, "sent")).total).toBe(0);
  });
});

test.describe("Z · Verbindung „Posteingang“ im Chat", () => {
  test("Z10 Menü „Verbindungen“: pro Chat gemerkt, neuer Chat ohne; Hinweis beim Umschalten; ohne Verbindung keine Mails", async ({ browser, baseURL, ip, admin }) => {
    const { guests } = await mailGroup(admin, 1);
    const chat = await openChat(browser, baseURL!, ip, { guest: guests[0] });
    const page = chat.page;
    const trigger = page.getByRole("button", { name: /^Verbindungen/ });
    await expect(trigger).toHaveAccessibleName("Verbindungen");
    const first = await chat.ask(`Erste Frage ${uniq()}`);
    expect(await chat.diagnosis(first, "Posteingang")).toBe("nicht verbunden");
    await expect(await chat.ask(`Was steht in meinem Posteingang? ${uniq()}`)).toContainText("Der Posteingang ist in diesem Chat nicht verbunden.");
    // Auch wenn das Modell es trotzdem versucht, lehnt der Server ab.
    await expect(await chat.ask(`#postfach-erzwingen ${uniq()}`)).toContainText("Werkzeug-Fehler: Der Posteingang ist in diesem Chat nicht verbunden.");

    // Per Tastatur einschalten
    await trigger.focus();
    await page.keyboard.press("Enter");
    const menu = page.getByRole("dialog", { name: "Verbindungen" });
    const sw = menu.getByRole("switch", { name: "Posteingang" });
    await expect(sw).toBeFocused();
    await expect(menu).toContainText("Freebie kann deine E-Mails lesen und in deinem Namen senden.");
    await page.keyboard.press("Space");
    await expect(sw).toHaveAttribute("aria-checked", "true");
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAccessibleName("Verbindungen: Posteingang verbunden");

    const on = await chat.ask(`Diagnose ${uniq()}`);
    expect(await chat.diagnosis(on, "Posteingang")).toBe("verbunden");
    await expect(page.getByRole("note").filter({ hasText: "Posteingang verbunden" })).toHaveCount(1);
    await expect(await chat.ask(`#postfach ${uniq()}`)).toContainText(WELCOME);

    // Neuer Chat startet ohne Verbindung; der alte merkt sie sich.
    await chat.newChat();
    await expect(trigger).toHaveAccessibleName("Verbindungen");
    await page.getByRole("navigation", { name: "Chatverlauf" }).getByRole("button", { name: /^Erste Frage/ }).click();
    await expect(trigger).toHaveAccessibleName("Verbindungen: Posteingang verbunden");
    await setConnection(page, false);
    const off = await chat.ask(`Wieder ohne ${uniq()}`);
    expect(await chat.diagnosis(off, "Posteingang")).toBe("nicht verbunden");
    await expect(page.getByRole("note").filter({ hasText: "Posteingang getrennt" })).toHaveCount(1);
  });

  test("Z11 „Gelesene E-Mails“ öffnen die Mail; Markdown-Export; gelöschte Mail; „Mit Freebie besprechen“", async ({ browser, baseURL, ip, admin }) => {
    const {
      guests: [a, b],
    } = await mailGroup(admin, 2);
    const chatA = await openChat(browser, baseURL!, ipFor(`${ip}-a`), { guest: a });
    const subject = `Angebot Raum ${uniq()}`;
    await sendMail(chatA.page.request, { to: [b.username], subject, body: "890 € netto" });
    const chat = await openChat(browser, baseURL!, ip, { guest: b });
    const mail = MailPage.of(chat);
    await setConnection(chat.page, true);
    const answer = await chat.ask("Was steht in meinem Posteingang?");
    await expect(answer).toContainText(subject);
    const cards = answer.getByRole("navigation", { name: "Gelesene E-Mails" });
    await expect(cards.getByRole("button")).toHaveCount(2);
    const card = cards.getByRole("button").filter({ hasText: subject });
    await expect(card).toContainText(`von ${a.username}`);

    const download = chat.page.waitForEvent("download");
    await chat.page.getByRole("button", { name: "Chat als Markdown exportieren" }).click();
    const md = readFileSync((await (await download).path())!, "utf8");
    expect(md).toContain("**Gelesene E-Mails:**");
    expect(md).toContain(`- „${subject}“ von ${address(a)}`);

    await card.click();
    await expect(chat.page).toHaveURL(/\?ansicht=posteingang$/);
    await expect(mail.reader.getByRole("heading", { name: subject })).toBeVisible();
    const toolbar = mail.reader.getByRole("toolbar", { name: "Aktionen für diese E-Mail" });
    await toolbar.getByRole("button", { name: "Löschen" }).click();
    await mail.reader.getByRole("alert").getByRole("button", { name: "Löschen" }).click();
    await expect(mail.row(re(subject))).toHaveCount(0);
    await mail.chatTab.click();
    await card.click();
    await expect(mail.reader.getByRole("alert")).toHaveText("Diese E-Mail gibt es nicht mehr.");

    await mail.row(new RegExp(WELCOME)).click();
    await toolbar.getByRole("button", { name: "Mit Freebie besprechen" }).click();
    await expect(chat.page).toHaveURL(/\/$/);
    await expect(chat.composer).toHaveValue(`Fasse die E-Mail „${WELCOME}“ von der Kursleitung zusammen und schlag mir eine Antwort vor.`);
    await expect(chat.page.getByRole("button", { name: "Verbindungen: Posteingang verbunden" })).toBeVisible();
    await expect(chat.answers).toHaveCount(0);
  });

  test("Z12 Freebie sieht nur das eigene Postfach, nie aus dem Antwort-Cache; Lesen durch Freebie ändert „ungelesen“ nicht", async ({ browser, baseURL, ip, admin }) => {
    const {
      guests: [a, b, c],
    } = await mailGroup(admin, 3);
    const chatC = await openChat(browser, baseURL!, ipFor(`${ip}-c`), { guest: c });
    const tag = uniq();
    await sendMail(chatC.page.request, { to: [a.username], subject: `Nur für A ${tag}` });
    const forB = await sendMail(chatC.page.request, { to: [b.username], subject: `Nur für B ${tag}` });
    const chatA = await openChat(browser, baseURL!, ip, { guest: a });
    const chatB = await openChat(browser, baseURL!, ipFor(`${ip}-b`), { guest: b });
    const unreadBefore = (await inboxOf(chatA.page.request)).unread;
    const question = `Was steht in meinem Posteingang? #postfach ${tag}`;
    for (const chat of [chatA, chatB]) await setConnection(chat.page, true);

    const answerA = await chatA.ask(question);
    const answerB = await chatB.ask(question);
    await expect(answerA).toContainText(`Nur für A ${tag}`);
    await expect(answerA).not.toContainText(`Nur für B ${tag}`);
    await expect(answerB).toContainText(`Nur für B ${tag}`);
    await expect(answerB).not.toContainText(`Nur für A ${tag}`);
    for (const answer of [answerA, answerB]) await expect(answer.getByText("aus dem Cache")).toHaveCount(0);
    // Dieselbe Frage im neuen Chat kommt wieder frisch.
    await chatA.newChat();
    await setConnection(chatA.page, true);
    await expect((await chatA.ask(question)).getByText("aus dem Cache")).toHaveCount(0);
    expect((await inboxOf(chatA.page.request)).unread).toBe(unreadBefore);

    // Eine fremde ID ergibt „nicht gefunden“.
    const foreign = await chatA.ask(`#mail-lesen:${forB.id} ${uniq()}`);
    await expect(foreign).toContainText(`Nicht gefunden: ${forB.id}`);
    await expect(foreign).not.toContainText(`Nur für B ${tag}`);
  });

  test("Z17 Freebie verschickt im Namen der Person: Kennzeichen „über Freebie“, nur eigene Gruppe, höchstens 5, Rückfrage beim Neu-Generieren", async ({ browser, baseURL, ip, admin }) => {
    const {
      guests: [a, b],
      others: [x],
    } = await mailGroup(admin, 2, 1);
    const chat = await openChat(browser, baseURL!, ip, { guest: a });
    const chatB = await openChat(browser, baseURL!, ipFor(`${ip}-b`), { guest: b });
    const countB = async () => (await inboxOf(chatB.page.request)).total;
    const before = await countB();

    // Ohne Verbindung wird nichts gesendet.
    await expect(await chat.ask(`#senden:${b.username} ${uniq()}`)).toContainText("Der Posteingang ist in diesem Chat nicht verbunden.");
    expect(await countB()).toBe(before);

    await setConnection(chat.page, true);
    const text = `Wir nehmen den Raum ${uniq()}`;
    const sent = await chat.ask(`Bitte schick das #senden:${b.username} ${text}`);
    await expect(sent).toContainText(`Gesendet: E-Mail gesendet`);
    await expect(sent.getByRole("navigation", { name: "Gesendete E-Mails" }).getByRole("button")).toContainText(`an ${b.username}`);
    const got = (await inboxOf(chatB.page.request)).mails.find((m) => m.from === a.username)!;
    expect(got.viaFreebie).toBe(true);
    expect((await inboxOf(chat.page.request, "sent")).mails[0].viaFreebie).toBe(true);
    const mailB = MailPage.of(chatB);
    await mailB.open();
    await expect(mailB.row(new RegExp(a.username))).toContainText("über Freebie");
    await mailB.row(new RegExp(a.username)).click();
    await expect(mailB.reader).toContainText("über Freebie gesendet");
    await expect(mailB.reader).toContainText(text);

    // Neu generieren fragt nach – abbrechen schickt nichts doppelt.
    let question = "";
    chat.page.once("dialog", (d) => {
      question = d.message();
      void d.dismiss();
    });
    await sent.getByRole("button", { name: "Neu generieren" }).click();
    await expect.poll(() => question).toBe("Diese Antwort hat E-Mails verschickt. Freebie könnte sie beim Neu-Generieren noch einmal senden. Trotzdem neu generieren?");
    await expect(chat.answers).toHaveCount(2);
    expect(await countB()).toBe(before + 1);

    // Fremde Gruppe: das Werkzeug lehnt ab.
    await expect(await chat.ask(`#senden:${x.username} ${uniq()}`)).toContainText(
      `Werkzeug-Fehler: Nicht gesendet: „${address(x)}“ kann nicht zugestellt werden. Du kannst nur deiner Gruppe und der Kursleitung schreiben.`,
    );
    // Höchstens 5 Mails pro Antwort.
    const many = await chat.ask(`#senden:${a.username} #anzahl:6 ${uniq()}`);
    await expect(many.getByText(/^Gesendet: E-Mail gesendet/)).toHaveCount(5);
    await expect(many).toContainText("Werkzeug-Fehler: Höchstens 5 E-Mails pro Antwort.");
  });
});

test.describe("Z · Posteingang auf Handy und Tablet, Barrierefreiheit", () => {
  test("Z14 Handy: Menü → Posteingang, Liste → Lesen → zurück, Schreiben im Vollbild @mobil", async ({ admin, page }) => {
    const { guests } = await mailGroup(admin, 1);
    await loginUser(page, { guest: guests[0] });
    const chat = new ChatPage(page);
    await chat.open();
    const mail = MailPage.of(chat);
    await page.getByRole("button", { name: "Menü öffnen" }).click();
    await mail.postTab.click();
    await expect(page.getByRole("heading", { name: "Posteingang", level: 1 })).toBeVisible();
    // Die Leiste schließt sich nach der Wahl.
    await expect(mail.postTab).not.toBeInViewport();
    await mail.row(new RegExp(WELCOME)).click();
    await expect(mail.list).toBeHidden();
    await expect(mail.reader.getByRole("heading", { name: WELCOME })).toBeVisible();
    await mail.reader.getByRole("button", { name: "Zurück zu „Posteingang“" }).click();
    await expect(mail.list).toBeVisible();
    await mail.newMail.click();
    const d = mail.dialog();
    await expect(d).toBeVisible();
    expect((await d.boundingBox())!.width).toBeGreaterThan(page.viewportSize()!.width - 20);
    await d.getByRole("button", { name: "Schließen" }).click();
    await expect(d).toBeHidden();
    // Ordner über das Menü
    await page.getByRole("button", { name: "Menü öffnen" }).click();
    await mail.folder("Gesendet").click();
    await expect(page.getByRole("heading", { name: "Gesendet", level: 1 })).toBeVisible();
    // Kein seitliches Scrollen
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("Z14 Tablet: Ordner in der Leiste, Liste und Lesen nacheinander @tablet", async ({ admin, page }) => {
    const { guests } = await mailGroup(admin, 1);
    await loginUser(page, { guest: guests[0] });
    const chat = new ChatPage(page);
    await chat.open();
    const mail = MailPage.of(chat);
    await mail.open();
    await expect(mail.folder("Gesendet")).toBeVisible();
    await mail.row(new RegExp(WELCOME)).click();
    await expect(mail.reader.getByRole("heading", { name: WELCOME })).toBeVisible();
    await mail.reader.getByRole("button", { name: "Zurück zu „Posteingang“" }).click();
    await expect(mail.list).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`Z15 Posteingang, Lesebereich, Schreiben und „Verbindungen“ sind barrierearm (${scheme === "light" ? "hell" : "dunkel"})`, async ({ browser, baseURL, ip, admin }, testInfo) => {
      const { guests } = await mailGroup(admin, 2);
      const chat = await openChat(browser, baseURL!, ip, { guest: guests[0] });
      await chat.page.emulateMedia({ colorScheme: scheme });
      const mail = MailPage.of(chat);
      await mail.open();
      await mail.row(new RegExp(WELCOME)).click();
      await expect(mail.reader.getByRole("heading", { name: WELCOME })).toBeVisible();
      await expectAccessible(chat.page, testInfo, `posteingang-${scheme}`);
      await mail.newMail.click();
      // Mit offenen Vorschlägen aus dem Adressbuch
      await mail.dialog().getByRole("textbox", { name: "An", exact: true }).fill(guests[1].username.slice(0, 3));
      await expect(mail.dialog().getByRole("list", { name: "Adressbuch für „An“" })).toBeVisible();
      await expectAccessible(chat.page, testInfo, `schreiben-${scheme}`);
      // Esc schließt erst die Vorschläge, dann den (leeren) Entwurf.
      await chat.page.keyboard.press("Escape");
      await expect(mail.dialog().getByRole("list", { name: "Adressbuch für „An“" })).toBeHidden();
      await chat.page.keyboard.press("Escape");
      await expect(mail.dialog()).toBeHidden();
      await mail.chatTab.click();
      await chat.page.getByRole("button", { name: /^Verbindungen/ }).click();
      await expectAccessible(chat.page, testInfo, `verbindungen-${scheme}`);
    });
  }
});
