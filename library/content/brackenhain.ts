// Gemeinde Brackenhain (kreisangehörig im Landkreis Altmoorland)
import type { DocSpec, ThreadSpec } from "../types";

export const documents: DocSpec[] = [
  {
    type: "word",
    id: "bh-gespraechsnotiz-laerm-dgh",
    title: "Gesprächsnotiz: Beschwerde über Lärm am Dorfgemeinschaftshaus",
    kind: "Gesprächsnotiz",
    fileName: "Gespraechsnotiz Beschwerde Laerm DGH Lindenweg",
    org: "brackenhain",
    unit: "bh-ordnung",
    author: "bh-krull",
    date: "2025-09-22",
    tags: ["personendaten", "unstrukturiert"],
    keywords: ["Lindenweg 14", "Wolters", "Nutzungsordnung", "Zimmerlautstärke"],
    summary:
      "Stichpunktartige Notiz zu einem Telefonat mit einem Anwohner, der sich über Feiern im Dorfgemeinschaftshaus beschwert – mit (erfundenen) personenbezogenen Daten und offenen Punkten.",
    meta: [["Aktenzeichen", "32-120.3"]],
    subject: "Tel. Beschwerde Hr. Wolters – Lärm DGH Lindenweg",
    blocks: [
      {
        t: "p",
        text: "**Anruf am 22.09.2025, 8:20–8:41 Uhr** (Hr. Wolters hat bereits am Freitag, 19.09., 22:47 Uhr eine E-Mail geschickt, siehe Posteingang Ordnungsamt)",
      },
      {
        t: "ul",
        items: [
          "Anrufer: Karl-Heinz Wolters, Lindenweg 14, 00758 Brackenhain, Tel. 040 66969-718 (privat), wohnt direkt gegenüber DGH",
          "Beschwerde: Feiern im DGH fast jedes WE, zuletzt Sa 20.09. „bis halb drei“, Musik mit Bass, Leute rauchen vor der Tür, Flaschen auf dem Gehweg",
          "Hr. W. sehr aufgebracht, droht mit Anwalt und „Zeitung“, will Namen der Mieter wissen (habe ich NICHT herausgegeben!)",
          "lt. Hr. W. am 20.09. Feier „Familie Özdemir“ (Geburtstag?) – stimmt mit Belegungsplan überein: Mieter Fr. Selin Özdemir, Am Kirchberg 3",
          "Hr. W. hat Handyvideo von 1:52 Uhr – Musik deutlich hörbar, will es schicken",
          "Polizei war NICHT da (Hr. W.: „bringt ja eh nichts“)",
        ],
      },
      { t: "h2", text: "Prüfung bisher" },
      {
        t: "ul",
        items: [
          "Nutzungsordnung DGH v. 2019: Nutzung bis 24:00 Uhr, „danach Zimmerlautstärke“ – keine klare Endzeit für Musik!",
          "Belegung Aug/Sept: 7 private Feiern an 6 Wochenenden (Liste Hauptamt, Fr. Höfer)",
          "Beschwerden 2024: 2 (beide Hr. W.), 2025 bisher 4 (3× Hr. W., 1× Ehepaar Brunke, Lindenweg 10)",
          "Kaution wurde bei Fam. Ö. nicht einbehalten, Hausmeister (Hr. Grabowski) hat Schlüssel am So 11 Uhr zurückbekommen, „alles sauber“",
        ],
      },
      { t: "h2", text: "Vereinbart / To do" },
      {
        t: "ol",
        items: [
          "Rückruf an Hr. W. bis Mi 24.09. mit Zwischenstand",
          "Fam. Ö. anschreiben (Hinweis auf Nutzungsordnung, keine Sanktion, da Endzeit unklar)",
          "Vorschlag an BGM: Nutzungsordnung ändern – Musik nur bis 22:00 Uhr, danach Fenster/Türen zu, Kaution erhöhen (150 → 300 €)?",
          "Lärmmessung? → Landkreis fragen (Untere Immissionsschutzbehörde), ob Messgerät ausgeliehen werden kann",
        ],
      },
      {
        t: "note",
        text: "Achtung Datenschutz: Namen der Mieter nicht an Beschwerdeführer weitergeben. Video von Hr. W. nur zur Akte, nicht weiterleiten (Personen evtl. erkennbar).",
      },
      { t: "signature", lines: ["Kr."] },
    ],
  },
];

export const threads: ThreadSpec[] = [
  {
    id: "bh-beschwerde-laerm-dgh",
    title: "Beschwerde über Lärm am Dorfgemeinschaftshaus",
    subject: "Beschwerde – unerträglicher Lärm am Dorfgemeinschaftshaus Lindenweg!!!",
    org: "brackenhain",
    unit: "bh-ordnung",
    date: "2025-09-23",
    tags: ["personendaten", "unstrukturiert"],
    keywords: ["Lindenweg", "Nutzungsordnung", "22:00 Uhr", "Kaution"],
    summary:
      "Ein Anwohner beschwert sich wütend über Feiern im Dorfgemeinschaftshaus. Das Ordnungsamt antwortet und schlägt dem Bürgermeister intern eine neue Nutzungsordnung vor.",
    mails: [
      {
        from: "ext-wolters",
        to: ["bh-krull"],
        date: "2025-09-19T22:47",
        signature: false,
        body: `Sehr geehrte Damen und Herren,

es reicht jetzt endgültig!!! Schon wieder wird im DGH gegenüber gefeiert, es ist fast 23 Uhr und die Musik dröhnt bei uns im Schlafzimmer. Das geht jetzt seit Wochen so, JEDES Wochenende. Letzten Samstag war bis halb drei Party, die Leute stehen rauchend auf dem Gehweg und schmeißen die Flaschen in unsere Hecke.

Ich habe mich schon zweimal beschwert und es passiert NICHTS. Wofür zahle ich eigentlich Steuern?? Ich will wissen, wer das Haus vermietet bekommt und wer das genehmigt. Wenn sich nichts ändert, gehe ich zum Anwalt und zur Zeitung.

Karl-Heinz Wolters
Lindenweg 14
00758 Brackenhain`,
      },
      {
        from: "bh-krull",
        to: ["ext-wolters"],
        date: "2025-09-22T11:05",
        body: `Sehr geehrter Herr Wolters,

vielen Dank für Ihre E-Mail vom 19.09. und für das Telefonat heute Morgen. Ich kann gut verstehen, dass die nächtliche Ruhestörung für Sie und Ihre Familie sehr belastend ist.

Wie besprochen prüfen wir derzeit die Belegung des Dorfgemeinschaftshauses und die Regeln der Nutzungsordnung. Bitte haben Sie Verständnis dafür, dass wir Ihnen aus Datenschutzgründen keine Namen der Mieterinnen und Mieter nennen dürfen. Die Mieter vom vergangenen Wochenende werden wir aber auf die Einhaltung der Nachtruhe hinweisen.

Ich melde mich bis Mittwoch, 24.09., mit einem Zwischenstand bei Ihnen. Sollte es in der Zwischenzeit erneut zu nächtlichem Lärm kommen, können Sie jederzeit die Polizei verständigen.

Mit freundlichen Grüßen
Im Auftrag
Lisa Krull`,
      },
      {
        from: "ext-wolters",
        to: ["bh-krull"],
        date: "2025-09-22T19:38",
        signature: false,
        body: `Hallo Frau Krull,

danke für den Rückruf, das war wenigstens mal eine Reaktion. Ich weiß übrigens auch so, dass es die Özdemirs vom Kirchberg waren, das hat ja das halbe Dorf mitbekommen. Die Brunkes von Nr. 10 haben sich auch schon beschwert.

Ich habe ein Video von 1:52 Uhr gemacht, darauf hört man die Musik ganz deutlich. Soll ich das schicken? Und können Sie nicht einfach eine Regel machen, dass um 22 Uhr Schluss ist? In der Nachbargemeinde geht das doch auch.

Gruß
K.-H. Wolters`,
      },
      {
        from: "bh-krull",
        to: ["bh-ruhnau"],
        cc: ["bh-hoefer"],
        date: "2025-09-23T09:12",
        attachments: ["bh-gespraechsnotiz-laerm-dgh"],
        quote: false,
        body: `Hallo Herr Ruhnau,

zur Info und mit der Bitte um Entscheidung: Wir haben am DGH Lindenweg ein zunehmendes Lärmproblem (2025 bisher vier Beschwerden von zwei Haushalten, siehe Gesprächsnotiz im Anhang). Herr Wolters droht mit Anwalt und Presse.

Problem ist unsere Nutzungsordnung von 2019: Nutzung bis 24 Uhr, danach „Zimmerlautstärke“ – das ist kaum durchsetzbar.

Vorschlag:
- Musik nur bis 22:00 Uhr, danach Fenster und Türen geschlossen
- Kaution von 150 € auf 300 € erhöhen, Einbehalt bei berechtigten Beschwerden
- Hausmeister macht stichprobenartig Kontrollgänge

Die Änderung müsste in den Haupt- und Finanzausschuss (nächste Sitzung 16.10.). Frau Höfer könnte eine Vorlage vorbereiten. Sollen wir so vorgehen?

Viele Grüße
Lisa Krull`,
      },
    ],
  },
];
