# Fundus – Regeln für Inhalte

Der Fundus enthält erfundene Dateien und E-Mails aus Verwaltungen, mit denen Teilnehmende üben können, ohne echte
Unterlagen hochzuladen. Alles wirkt echt, ist aber nachweislich erfunden. Plan und Entscheidungen: [FUNDUS-PLAN.md](../FUNDUS-PLAN.md).

## Aufbau

| Pfad | Inhalt |
|---|---|
| `world.ts` | Verwaltungen, Organisationseinheiten und Personen (das gemeinsame Weltmodell) |
| `content/<verwaltung>.ts` | Dokumente (Word, Excel, PowerPoint) und E-Mail-Verläufe als Daten; große Verwaltungen auf mehrere Dateien verteilt (z. B. `falkenbrueck-dez4-6.ts`) |
| `build/` | Generator: Word (`docx`), Excel (`exceljs`), PowerPoint (`pptxgenjs`), E-Mail (eigener MIME-Schreiber), Signets, Formel-Rechner |
| `build/fiction.ts` | Regeln für „erfunden“ (Adressen, Rufnummern, Postleitzahlen, IBANs, Sperrliste) |
| `build/check.ts` | Prüft einzelne Inhaltsdateien, ohne den ganzen Fundus zu erzeugen |

**Umfang:** 150 Dokumente (60 Word, 50 Excel, 40 PowerPoint) und 40 E-Mail-Verläufe aus neun Verwaltungen. Schwerpunkt
Kommune: Stadt Falkenbrück, Landkreis Altmoorland, Stadt Rabensfurt, Gemeinde Brackenhain und der Zweckverband Kommunale
IT Altmoor stellen gut zwei Drittel der Inhalte; dazu je zwei Behörden von Land und Bund.

`npm run library` erzeugt daraus `.library/` (Dateien, `manifest.json`, Vorschau-Daten). Das passiert automatisch vor
`npm run dev`, `npm run build` (also auch auf Vercel) und vor den Unit-Tests. Unveränderte Quellen werden nicht neu
erzeugt. Jeder Build ergibt byte-gleiche Dateien, damit Datei- und Antwort-Cache über Deploys hinweg greifen.

## Regeln (werden in `tests/unit/library.test.ts` geprüft)

- **Erfunden:** Orte, Behörden, Personen, Firmen, Parteien und Produkte sind erfunden. Neue Ortsnamen vorher per
  Websuche und gegen das amtliche Gemeindeverzeichnis prüfen. Erlaubte Orte: Falkenbrück, Rhedenburg, Landkreis
  Altmoorland mit Altmoor, Rabensfurt, Brackenhain, Fennhusen, Torfkamp, Schilfwerder, Lütjenbrook und Krähenwerder;
  Berlin und Bonn nur als Dienstsitz der Bundesbehörden. Echte Gesetze, Verordnungen und Normen dürfen vorkommen, echte
  Behörden, Orte, Personen, Parteien und Marken nicht (Sperrliste in `build/fiction.ts`).
- **Adressen:** Mail- und Webadressen enden auf `.example` (RFC 2606) – Antworten aus Outlook können nie ankommen.
- **Telefon:** nur aus den Spielfilm-Bereichen der Bundesnetzagentur (`030 23125`, `069 90009`, `040 66969`), immer mit
  dreistelliger Durchwahl.
- **Postleitzahlen:** beginnen mit `00` (gibt es in Deutschland nicht). Zahlen ab 10.000 deshalb mit Tausenderpunkt
  schreiben, sonst sieht „12500 Euro“ für den Test wie eine Anschrift aus.
- **IBANs:** nur mit ungültiger Prüfziffer (z. B. `DE00 …`).
- **Kennzeichnung:** Dateieigenschaften und Fußzeile „Fiktives Übungsdokument – Freebie-Fundus“; Mails tragen den Kopf
  `X-Freebie-Fundus` und einen Hinweis am Ende.
- **Pflichtbegriffe:** Jeder Eintrag nennt `keywords`, die wörtlich im ausgelesenen Text stehen müssen.

## Neue Inhalte anlegen

1. Personen und Einheiten bei Bedarf in `world.ts` ergänzen. Durchwahlen, Mail-Adressen und Dateinamen müssen eindeutig
   sein (prüft `validate.ts`).
2. Dokument oder Verlauf in der passenden Datei unter `content/` anlegen (Typen in `types.ts`). Merkmale (`tags`)
   setzen, wenn ein Inhalt bewusst Widersprüche, fiktive Personendaten oder unstrukturierte Notizen enthält; die Länge
   (kurz/mittel/lang) ergibt sich aus der Token-Schätzung.
3. Excel-Formeln schreiben wie in Excel (englische Funktionsnamen). `{r}` steht für die eigene Zeile, `{first}` und
   `{last}` für die erste und letzte Datenzeile. Der Generator rechnet die Ergebnisse mit, unterstützt werden
   `SUM`, `AVERAGE`, `MIN`, `MAX`, `COUNT`, `COUNTA`, `ROUND`, `ABS`, `IF`.
4. `npm run library:check -- library/content/<datei>.ts` – erzeugt die Datei im Speicher, liest sie aus und meldet
   fehlende Pflichtbegriffe, unbekannte Personen, Verstöße gegen die Regeln sowie Länge und Merkmale je Eintrag.
   Mehrere Personen können so parallel an verschiedenen Dateien arbeiten.
5. Zum Schluss `npm run library` und `npm run test` über den ganzen Fundus.
