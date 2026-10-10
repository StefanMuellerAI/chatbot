// E-Mails (.eml, RFC 5322) mit Outlook-typischem Zitatverlauf, Signatur und Dateianhängen.
import type { LibraryPersonRef, MailPreview } from "@/lib/library/types";
import type { MailSpec, ThreadSpec } from "../types";
import { FICTION_MAIL_NOTE } from "./constants";
import { berlinIso, dateTimeLong, plain, rfc5322Date } from "./format";
import { email, fullName, org, person, personRef, phone, unitChain } from "./resolve";

export interface MailAttachment {
  id: string;
  title: string;
  fileName: string;
  type: "word" | "excel" | "powerpoint";
  mime: string;
  data: Buffer;
}

export interface RenderedMail {
  id: string;
  subject: string;
  date: string;
  fileName: string;
  data: Buffer;
  preview: MailPreview;
}

const CRLF = "\r\n";

export function mailSubject(thread: ThreadSpec, index: number): string {
  const mail = thread.mails[index];
  return mail.subject ?? (index === 0 ? thread.subject : `AW: ${thread.subject}`);
}

export function mailId(thread: ThreadSpec, index: number): string {
  return `${thread.id}-${index + 1}`;
}

/** Signatur wie in Behörden üblich: Name, Funktion, Einheit, Anschrift, Kontakt. */
function signature(personId: string): string {
  const p = person(personId);
  if (!p.org) return p.company ? [fullName(p), p.role, p.company].join("\n") : "";
  const o = org(p.org);
  const units = unitChain(p.org, p.unit!)
    .slice(-2)
    .map((u) => u.name);
  return [fullName(p), p.role, "", o.name, ...units, o.address.join(", "), `Telefon: ${phone(p)}`, `E-Mail: ${email(p)}`].join("\n");
}

function hasSignature(mail: MailSpec): boolean {
  if (mail.signature !== undefined) return mail.signature;
  const p = person(mail.from);
  return Boolean(p.org || p.company);
}

/** Eigener Text einer Mail inklusive Signatur (ohne Zitat). */
export function ownText(mail: MailSpec): string {
  const body = plain(mail.body).trim();
  return hasSignature(mail) ? `${body}\n\n--\n${signature(mail.from)}` : body;
}

const addressList = (ids: string[]) => ids.map((id) => `${fullName(person(id))} <${email(person(id))}>`).join("; ");

/** Zitatblock im Stil von Outlook (ohne „>“, mit Kopfzeilen). */
function quoteBlock(thread: ThreadSpec, index: number): string {
  const mail = thread.mails[index];
  return [
    "________________________________",
    `Von: ${fullName(person(mail.from))} <${email(person(mail.from))}>`,
    `Gesendet: ${dateTimeLong(mail.date)}`,
    `An: ${addressList(mail.to)}`,
    ...(mail.cc?.length ? [`Cc: ${addressList(mail.cc)}`] : []),
    `Betreff: ${mailSubject(thread, index)}`,
    "",
    ownText(mail),
  ].join("\n");
}

/** Vollständiger Text einer Mail: eigener Text und – wenn gewünscht – der frühere Verlauf. */
export function fullText(thread: ThreadSpec, index: number): string {
  const parts = [ownText(thread.mails[index])];
  if (thread.mails[index].quote !== false) {
    for (let i = index - 1; i >= 0; i--) {
      parts.push(quoteBlock(thread, i));
      if (thread.mails[i].quote === false) break;
    }
  }
  return parts.join("\n\n");
}

// ---------------------------------------------------------------- MIME

function isAscii(s: string): boolean {
  return /^[\x20-\x7e]*$/.test(s);
}

/** Kodiert Kopfzeilen-Text nach RFC 2047 (Base64, UTF-8, Wörter höchstens 75 Zeichen). */
export function encodeWord(text: string): string {
  if (isAscii(text)) return text;
  const words: string[] = [];
  let chunk = "";
  for (const ch of text) {
    const next = chunk + ch;
    if (Buffer.byteLength(next, "utf8") > 45) {
      words.push(chunk);
      chunk = ch;
    } else chunk = next;
  }
  if (chunk) words.push(chunk);
  return words.map((w) => `=?UTF-8?B?${Buffer.from(w, "utf8").toString("base64")}?=`).join(`${CRLF} `);
}

function mailbox(ref: LibraryPersonRef): string {
  const name = isAscii(ref.name) ? (/[()<>[\]:;@\\,."]/.test(ref.name) ? `"${ref.name.replace(/"/g, '\\"')}"` : ref.name) : encodeWord(ref.name);
  return `${name} <${ref.email}>`;
}

/** Quoted-Printable (RFC 2045) mit Zeilen bis 76 Zeichen und CRLF. */
export function quotedPrintable(text: string): string {
  const lines = text.replace(/\r?\n/g, "\n").split("\n");
  return lines
    .map((line) => {
      let encoded = "";
      for (const byte of Buffer.from(line, "utf8")) {
        const ch = String.fromCharCode(byte);
        encoded += (byte >= 33 && byte <= 126 && ch !== "=") || byte === 32 ? ch : `=${byte.toString(16).toUpperCase().padStart(2, "0")}`;
      }
      encoded = encoded.replace(/ $/, "=20");
      const out: string[] = [];
      while (encoded.length > 76) {
        let cut = 75;
        // keine kodierte Sequenz zerschneiden
        const eq = encoded.lastIndexOf("=", cut);
        if (eq > cut - 3) cut = eq;
        out.push(`${encoded.slice(0, cut)}=`);
        encoded = encoded.slice(cut);
      }
      out.push(encoded);
      return out.join(CRLF);
    })
    .join(CRLF);
}

function base64Lines(data: Buffer): string {
  return (data.toString("base64").match(/.{1,76}/g) ?? []).join(CRLF);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function htmlParagraphs(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 10px 0">${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}

function html(thread: ThreadSpec, index: number): string {
  const mail = thread.mails[index];
  const parts: string[] = [htmlParagraphs(plain(mail.body).trim())];
  if (hasSignature(mail))
    parts.push(`<p style="margin:16px 0 0 0;color:#595959;font-size:9.5pt">${escapeHtml(signature(mail.from)).replace(/\n/g, "<br>")}</p>`);
  if (mail.quote !== false) {
    for (let i = index - 1; i >= 0; i--) {
      const q = thread.mails[i];
      parts.push(
        `<div style="border-top:1px solid #e1e1e1;padding-top:8px;margin-top:16px"><p style="margin:0 0 10px 0;font-size:10pt"><b>Von:</b> ${escapeHtml(fullName(person(q.from)))} &lt;${escapeHtml(email(person(q.from)))}&gt;<br><b>Gesendet:</b> ${escapeHtml(dateTimeLong(q.date))}<br><b>An:</b> ${escapeHtml(addressList(q.to))}${q.cc?.length ? `<br><b>Cc:</b> ${escapeHtml(addressList(q.cc))}` : ""}<br><b>Betreff:</b> ${escapeHtml(mailSubject(thread, i))}</p>${htmlParagraphs(ownText(q))}</div>`,
      );
      if (q.quote === false) break;
    }
  }
  parts.push(`<p style="margin:24px 0 0 0;color:#a6a6a6;font-size:8pt">${escapeHtml(FICTION_MAIL_NOTE)}</p>`);
  return `<html><head><meta charset="utf-8"></head><body style="font-family:Calibri,Arial,sans-serif;font-size:11pt;color:#1f1f1f">\n${parts.join("\n")}\n</body></html>`;
}

/** Dateiname wie beim Speichern aus dem Mailprogramm, mit Datum vorne und Absender hinten. */
export function mailFileName(subject: string, date: string, sender: string): string {
  const safe = subject
    .replace(/\//g, "-")
    .replace(/[:\\?*"<>|]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return `${date.slice(0, 10)} ${safe} (${sender}).eml`;
}

export function renderMail(thread: ThreadSpec, index: number, attachments: MailAttachment[]): RenderedMail {
  const mail = thread.mails[index];
  const id = mailId(thread, index);
  const subject = mailSubject(thread, index);
  const from = personRef(mail.from);
  const to = mail.to.map(personRef);
  const cc = (mail.cc ?? []).map(personRef);
  const domainOf = (i: number) => email(person(thread.mails[i].from)).split("@")[1];
  const messageId = (i: number) => `<${mailId(thread, i)}.fundus@${domainOf(i)}>`;
  const boundary = (kind: string) => `----=_Fundus_${kind}_${id}`;

  const text = `${fullText(thread, index)}\n\n${FICTION_MAIL_NOTE}\n`;
  const headers = [
    `Message-ID: ${messageId(index)}`,
    `Date: ${rfc5322Date(mail.date)}`,
    `From: ${mailbox(from)}`,
    `To: ${to.map(mailbox).join(`,${CRLF} `)}`,
    ...(cc.length ? [`Cc: ${cc.map(mailbox).join(`,${CRLF} `)}`] : []),
    `Subject: ${encodeWord(subject)}`,
    ...(index > 0 ? [`In-Reply-To: ${messageId(index - 1)}`, `References: ${Array.from({ length: index }, (_, i) => messageId(i)).join(" ")}`] : []),
    "MIME-Version: 1.0",
    "Content-Language: de-DE",
    "X-Freebie-Fundus: fiktive Uebungs-E-Mail",
  ];

  const alternative = [
    `Content-Type: multipart/alternative; boundary="${boundary("alt")}"`,
    "",
    `--${boundary("alt")}`,
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: quoted-printable",
    "",
    quotedPrintable(text),
    `--${boundary("alt")}`,
    "Content-Type: text/html; charset=utf-8",
    "Content-Transfer-Encoding: quoted-printable",
    "",
    quotedPrintable(html(thread, index)),
    `--${boundary("alt")}--`,
  ];

  let body: string[];
  if (attachments.length) {
    body = [
      `Content-Type: multipart/mixed; boundary="${boundary("mixed")}"`,
      "",
      "This is a multi-part message in MIME format.",
      "",
      `--${boundary("mixed")}`,
      ...alternative,
    ];
    for (const a of attachments) {
      const encodedName = encodeURIComponent(a.fileName).replace(/['()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
      body.push(
        "",
        `--${boundary("mixed")}`,
        `Content-Type: ${a.mime}; name="${encodeWord(a.fileName)}"`,
        "Content-Transfer-Encoding: base64",
        `Content-Disposition: attachment; filename*=UTF-8''${encodedName}`,
        "",
        base64Lines(a.data),
      );
    }
    body.push(`--${boundary("mixed")}--`, "");
  } else {
    body = [...alternative, ""];
  }

  const data = Buffer.from([...headers, ...body].join(CRLF), "utf8");
  return {
    id,
    subject,
    date: berlinIso(mail.date),
    fileName: mailFileName(subject, mail.date, person(mail.from).last),
    data,
    preview: {
      id,
      subject,
      from,
      to,
      cc,
      date: berlinIso(mail.date),
      body: ownText(mail),
      attachments: attachments.map((a) => ({ id: a.id, title: a.title, fileName: a.fileName, type: a.type })),
    },
  };
}
