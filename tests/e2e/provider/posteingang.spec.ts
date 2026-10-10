import type { Page } from "@playwright/test";
import { expect, ipFor, openChat, test, uniq } from "../support/fixtures";
import { fakeRequests } from "../support/fake";
import { address, guestApi, inboxOf, mailGroup, sendMail, setConnection } from "../support/mail";

// V07: Claude und GPT nutzen die Postfach-Werkzeuge über die echten Adapter (Fake-API spielt das Modell):
// Liste → Lesen → Antwort mit Betreff, Senden → Mail beim Empfänger, ohne Verbindung ein Werkzeug-Fehler.

const MODELS = [
  { name: "Claude Sonnet 5.5", path: "/v1/messages" },
  { name: "GPT-6.1 Sol", path: "/v1/responses" },
] as const;

async function chooseModel(page: Page, name: string) {
  const picker = page.getByRole("button", { name: /^Modell:/ });
  await picker.click();
  await page.getByRole("listbox", { name: "Modell wählen" }).getByRole("option", { name: new RegExp(`^${name.replace(/\./g, "\\.")}`) }).click();
  await expect(picker).toHaveAccessibleName(`Modell: ${name}`);
}

for (const m of MODELS) {
  test.describe(`V07 · ${m.name}`, () => {
    test(`V07 ${m.name}: liest den Posteingang, nennt den Betreff und sendet im Namen der Person`, async ({ browser, baseURL, ip, admin }) => {
      const {
        guests: [a, b],
      } = await mailGroup(admin, 2);
      // B meldet sich zuerst an (Begrüßung), danach kommt die Mail von A – sie ist die neueste.
      const chat = await openChat(browser, baseURL!, ip, { guest: b });
      const subject = `Angebot Raum Rhein ${uniq()}`;
      await sendMail(await guestApi(baseURL!, ipFor(`${ip}-a`), a), { to: [b.username], subject, body: "890 € netto, mit Beamer." });
      await chooseModel(chat.page, m.name);

      // Ohne Verbindung: das Werkzeug lehnt ab, das Modell gibt den Hinweis weiter.
      const off = uniq();
      await expect(await chat.ask(`Was steht in meinem Posteingang? #fake:postfach ${off}`)).toContainText(
        "Der Posteingang ist in diesem Chat nicht verbunden. Die Person kann ihn unten im Eingabefeld unter „Verbindungen“ einschalten.",
      );
      expect((await inboxOf(chat.page.request)).unread).toBe(2);

      await setConnection(chat.page, true);
      const id = uniq();
      const answer = await chat.ask(`Was steht in meinem Posteingang? #fake:postfach ${id}`);
      await expect(answer).toContainText(`Im Posteingang liegt: „${subject}“.`);
      const cards = answer.getByRole("navigation", { name: "Gelesene E-Mails" }).getByRole("button");
      await expect(cards).toHaveCount(1);
      await expect(cards).toContainText(subject);
      await expect(cards).toContainText(`von ${a.username}`);
      // Die Werkzeug-Ergebnisse gingen als Material an das Modell zurück: erst die Liste, dann die Mail.
      const requests = (await fakeRequests(id, m.path)).filter((r) => r.body.stream === true).sort((x, y) => x.at - y.at);
      expect(requests).toHaveLength(3);
      expect(JSON.stringify(requests[1].body)).toContain(`Postfach von ${address(b)}`);
      expect(JSON.stringify(requests[2].body)).toContain("890 € netto, mit Beamer.");
      // Lesen durch Freebie markiert nichts als gelesen.
      expect((await inboxOf(chat.page.request)).unread).toBe(2);

      const sendId = uniq();
      const sent = await chat.ask(`Antworte bitte #fake:senden:${a.username} ${sendId}`);
      await expect(sent).toContainText(`Gesendet laut Werkzeug: E-Mail gesendet`);
      await expect(sent).toContainText(`an ${address(a)}`);
      await expect(sent.getByRole("navigation", { name: "Gesendete E-Mails" }).getByRole("button")).toContainText(`an ${a.username}`);
      const got = (await inboxOf(await guestApi(baseURL!, ipFor(`${ip}-a2`), a))).mails.find((mail) => mail.subject === "Fake-Antwort");
      expect(got).toMatchObject({ from: b.username, viaFreebie: true });

      // An eine Person außerhalb der Gruppe: Werkzeug-Fehler, nichts verschickt.
      const before = (await inboxOf(chat.page.request, "sent")).total;
      await expect(await chat.ask(`#fake:senden:jemand-anderes ${uniq()}`)).toContainText("Werkzeug-Fehler: ");
      expect((await inboxOf(chat.page.request, "sent")).total).toBe(before);
    });
  });
}
