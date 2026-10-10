# Handbuch

Es gibt zwei Fassungen. Die Screenshots entstehen automatisch aus der aktuellen Version; beide nutzen dieselben.

| PDF | Für wen | Inhalt |
|---|---|---|
| [`docs/Freebie-Handbuch.pdf`](../Freebie-Handbuch.pdf) | Kolleginnen und Kollegen (Kursleitung) | Chat (für Gäste und Kursleitung), Admin-Bereich, Regeln und Fristen |
| [`docs/Freebie-Handbuch-Teilnehmende.pdf`](../Freebie-Handbuch-Teilnehmende.pdf) | Teilnehmende (Gäste) | Erste Schritte, Chat und Posteingang aus Sicht der Gäste, Datenschutz, Checkliste und häufige Fragen – ohne Admin-Bereich, in der Du-Form wie die App |

## Neu erzeugen

```bash
npm run build           # Produktions-Build (das Skript startet ihn im Testmodus)
npm run docs:handbuch   # etwa 2 Minuten, schreibt beide PDFs
```

Das Skript startet Freebie im Testmodus (`FREEBIE_MOCK=1`) mit frischer Datenbank auf Port 3400. Danach:

1. Es legt Beispieltermine an und lädt Beispiel-Chats über die Import-Funktion.
2. Es nimmt alle Screenshots mit Playwright auf.
3. Es rendert beide Handbücher mit Chromium. Für die Seitenzahlen im Inhaltsverzeichnis rendert es jedes mehrfach,
   bis sie sich nicht mehr ändern.

Schlägt ein Screenshot fehl, bricht es ab, statt ein unvollständiges PDF zu schreiben. Zwischenstände (Screenshots,
Schriften, Beispieldateien) liegen in `.data/handbuch/`.

## Dateien

| Datei | Inhalt |
|---|---|
| `handbuch.html` | Der Text des Handbuchs für die Kursleitung mit Deckblatt; Bilder als `shots/<name>.jpg` |
| `teilnehmende.html` | Der Text des Handbuchs für Teilnehmende (eigene Fußzeile im `<style>` oben) |
| `style.css` | Gestaltung für den Druck (A4, Fußzeile mit Seitenzahlen, Farben und Schriften der App) |
| `inhalt.js` | Baut das Inhaltsverzeichnis und trägt den Stand (Monat, Jahr) auf dem Deckblatt ein |
| `screenshots.mjs` | Legt die Beispieldaten an und nimmt die Screenshots auf (`c…` = Chat, `a…` = Admin) |
| `beispieldaten.mjs` | Beispiel-Chats sowie Beispielzahlen für Übersicht und Termine |
| `erstellen.mjs` | Ablauf: Server starten, Screenshots, Schriften übernehmen, beide PDFs rendern |

**Text ändern:** `handbuch.html` bzw. `teilnehmende.html` bearbeiten. Kapitel sind `<h2 id="…">` mit Nummer, Teile
`<section class="part">`. Das Inhaltsverzeichnis entsteht daraus von selbst. Was den Chat betrifft, steht in beiden
Fassungen – eine Änderung dort meist in beiden nachziehen (die Kapitelnummern unterscheiden sich ab Teil 3).

**Neuer Screenshot:** In `screenshots.mjs` einen `step(…)` mit `shot(…)` ergänzen und das Bild in `handbuch.html`
und/oder `teilnehmende.html` als `<figure>` einbinden. `c32-kaertchen` (ein Zugangskärtchen) nutzt nur das Handbuch
für Teilnehmende.

## Hinweise

- Alle Inhalte sind Beispieldaten; das Handbuch sagt das auch.
- Im Testmodus entstehen keine Kosten. Für Übersicht und Termine setzt das Skript im Browser deshalb
  Beispielzahlen und den Systemstatus einer Live-Installation ein. Die Druckkärtchen zeigen „freebie.stefanai.de“.
- Der Bild-Modus liefert im Testmodus ein Platzhalterbild. Die Bildunterschrift im Handbuch sagt das.
