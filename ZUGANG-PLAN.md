# Plan: Gast- und Admin-Zugang mit Terminen

Stand: 9. Oktober 2026 · Grundlage: aktueller Code (`proxy.ts`, `lib/auth/*`, Admin-Bereich, E2E-Suite)

## 1. Ziel

Statt eines gemeinsamen Teilnehmer-Passworts gibt es zwei Rollen mit eigenen Zugängen:

| Rolle | Chat | Admin-Bereich | Anmeldung | Gültig |
|---|---|---|---|---|
| **Admin** | ja | ja | Benutzername + Passwort (aus der Umgebung) | 12 Stunden je Sitzung |
| **Gast** | ja | nein | Benutzername + Passwort (vom Admin erzeugt) | nur während seines Termins |

Der Admin legt **Termine** an (höchstens einen Tag lang). Jeder Termin hat **beliebig viele Gruppen**, jede Gruppe
**beliebig viele Gäste**. Jeder Gast bekommt einen einfachen Benutzernamen und ein einfaches Passwort. Mit dem Ende
des Termins verfallen die Zugänge **sofort**: Laufende Sitzungen enden, neue Anmeldungen werden abgelehnt.

Die E2E-Suite bleibt vollständig. Jede heutige Katalog-ID wird angepasst oder durch eine neue ersetzt, und neue
Funktionen bekommen eigene Tests (Abschnitt 9).

## 2. Ablauf

**Kursleitung (Admin), vor der Schulung**

1. Unter Admin → **Termine** einen Termin anlegen: Name, Beginn, Ende (z. B. „KI-Grundlagen Köln“, 10. Okt., 9:00–16:30).
2. Gruppen hinzufügen (z. B. „Vormittag“, „Gruppe B“), je Gruppe die Anzahl der Gäste angeben → Zugänge werden erzeugt.
3. Zugangskärtchen drucken (Druckansicht mit Schnittkanten) oder als CSV herunterladen.
4. Bei Bedarf: weitere Gäste nachlegen, einzelne Zugänge löschen oder neu würfeln, Termin verlängern oder
   **„Jetzt beenden“**.

**Gast**

1. Öffnet Freebie und meldet sich mit Benutzername und Passwort von seinem Kärtchen an.
2. Sieht nur den Chat, ohne Admin-Link. Oben steht „Zugang gültig bis 16:30“.
3. Zehn Minuten vor Ende erscheint ein Hinweis, dass er seine Chats jetzt exportieren kann.
4. Mit dem Termin-Ende landet er bei der nächsten Aktion auf der Login-Seite: „Dein Zugang ist abgelaufen.“

**Admin im Chat**

Er meldet sich über dieselbe Login-Seite an und nutzt den Chat wie bisher. Über „Admin“ in der Seitenleiste gelangt
er ohne zweite Anmeldung in den Admin-Bereich.

## 3. Datenmodell (neue Tabellen, automatisch angelegt)

| Tabelle | Felder |
|---|---|
| `events` | `id`, `name`, `starts_at`, `ends_at`, `ended_early_at` (für „Jetzt beenden“), `created_at` |
| `event_groups` | `id`, `event_id`, `name`, `sort_order` |
| `guests` | `id`, `event_id`, `group_id`, `username` (eindeutig, klein), `password_hash` (scrypt), `password_enc` (verschlüsselt, nur für den Druck), `last_login_at`, `created_at` |

Weitere Änderungen:

- **`usage_log`:** neue Spalten `role`, `event_id`, `group_id`. Damit lassen sich die Kosten pro Termin und Gruppe
  auswerten.
- **`login_attempts`:** zählt künftig zusätzlich pro Benutzername.
- **Einstellungen:** `appPasswordHash` fällt weg (siehe Abschnitt 8). `sessionVersion` bleibt für „Alle abmelden“.

Prüfregeln:

- **Termin:** Ende liegt nach dem Beginn, höchstens 24 Stunden später und nicht in der Vergangenheit.
- **Gruppenname:** 1–60 Zeichen.
- **Gäste:** 1–200 je Vorgang.

## 4. Zugangsdaten

- **Benutzername:** ein Wort plus zwei Ziffern, klein geschrieben, z. B. `fuchs27` oder `wolke83`.
  - Die Wörter kommen aus einer festen Liste von rund 300 kurzen deutschen Wörtern.
  - Keine Umlaute, keine verwechselbaren Zeichen (`l/1`, `o/0`).
  - Eindeutig über alle bestehenden Gäste.
  - Groß-/Kleinschreibung und Leerzeichen spielen bei der Anmeldung keine Rolle.
- **Passwort:** ein anderes Wort plus drei Ziffern, z. B. `sonne482`. Das sind rund 300.000 Möglichkeiten je Konto.
  Zusammen mit der Login-Bremse und der kurzen Gültigkeit reicht das für eine Übungsumgebung.
- **Speicherung:**
  - Passwörter liegen nur als scrypt-Hash vor (wie heute das Admin-gesetzte Passwort).
  - Damit die Kursleitung Kärtchen auch später noch drucken kann, gibt es zusätzlich eine mit `SESSION_SECRET`
    verschlüsselte Kopie (AES-GCM).
  - Beide werden mit dem Termin-Ende gelöscht.
- **Kärtchen:** Druckansicht (A4, 3 × 8 Kärtchen) mit Freebie-Logo, Adresse, Termin, Gruppe, Benutzername, Passwort und
  Gültigkeit. Dazu ein CSV-Export je Gruppe oder Termin.

## 5. Anmeldung und Sitzungen

- **Eine Login-Seite** für alle (`/login`) mit Benutzername und Passwort. Die separate Admin-Anmeldung unter `/admin`
  entfällt; `/admin` leitet ohne Admin-Sitzung zum Login.
- **Ein Sitzungs-Cookie** (`freebie_session`, HttpOnly, SameSite=Lax, Secure über HTTPS) mit signiertem Token. Es
  enthält:
  - `role` (`admin` | `guest`)
  - `sid`
  - bei Gästen `gid` (Gast), `eid` (Termin), `grp` (Gruppe)
  - `v` (Sitzungsversion)
- **Ablauf zur Endzeit:**
  - Das Token eines Gastes läuft genau zum Termin-Ende ab, nicht nach 12 Stunden. Der Proxy weist es ab diesem
    Moment ohne Datenbankabfrage ab.
  - Wird ein Termin früher beendet, verkürzt, gelöscht oder ein Gast entfernt, merkt das die Serverprüfung
    (`requireUser`, alle 16 Stellen) beim nächsten Aufruf. Sie prüft Gast und Termin in der Datenbank, mit 15
    Sekunden Zwischenspeicher pro Instanz.
  - Spätestens nach diesen 15 Sekunden ist der Zugang also weg.
- **Vor Beginn:** Die Anmeldung ist ab 30 Minuten vor Beginn möglich (zum Ausprobieren). Davor kommt
  „Dein Termin beginnt am 10. Oktober um 9:00 Uhr.“
- **Rechte:**
  - `/api/admin/*` und der Admin-Bereich verlangen `role = admin`. Ein Gast bekommt 403.
  - Alle anderen Routen verlangen eine gültige Sitzung (401 wie heute).
  - Ändernde Admin-Aufrufe prüfen zusätzlich den `Origin`-Header.
- **Login-Bremse:**
  - Wie heute 50 Fehlversuche je 10 Minuten und IP (eine ganze Gruppe hinter einer IP bleibt möglich).
  - Neu: höchstens 10 Fehlversuche je 10 Minuten und Benutzername. Das bremst gezieltes Raten bei einem Konto.
  - Die Meldung unterscheidet nicht zwischen unbekanntem Namen und falschem Passwort.
- **Admin-Konto:** `ADMIN_USERNAME` (Standard `admin`) und `ADMIN_PASSWORD` aus der Umgebung. Admin-Sitzungen gelten
  12 Stunden.
- **„Alle abmelden“** (Admin → Sicherheit) erhöht wie heute die Sitzungsversion. Das betrifft alle Gäste und alle
  anderen Admin-Sitzungen, nicht die eigene.

## 6. Admin-Oberfläche: neuer Bereich „Termine“

- **Liste** mit den Reitern „Läuft“, „Geplant“ und „Vorbei“. Pro Termin stehen dort:
  - Name, Zeitraum und Status
  - Anzahl der Gruppen und Gäste
  - wie viele Gäste schon angemeldet waren
  - bisherige Kosten
- **Termin anlegen/bearbeiten:** Dialog mit Name, Datum, „von“ und „bis“. Endet „bis“ vor „von“, liegt das Ende am
  Folgetag. Insgesamt sind höchstens 24 Stunden möglich, Fehlermeldungen kommen auf Deutsch.
- **Termin-Detail:**
  - Gruppen als Karten mit Gästeliste: Benutzername, Passwort (aufdeckbar), „zuletzt angemeldet“.
  - Aktionen: Gruppe umbenennen oder löschen, Gäste hinzufügen (Anzahl), einzelnen Gast löschen,
    Passwort neu erzeugen.
  - Drucken und CSV gibt es je Gruppe und für den ganzen Termin.
- **Aktionen am Termin:** „Jetzt beenden“ (mit Bestätigung, wirkt sofort), Verlängern über Bearbeiten, Löschen.
  Beim Löschen werden die Gäste sofort entfernt; die Kosten bleiben in der Statistik.
- **Übersicht:** neue Tabelle „Nach Termin“ mit Anfragen, Kosten, Ersparnis und aktiven Gästen. Per Klick
  aufgeschlüsselt nach Gruppe.
- **Sicherheit:** Der Abschnitt „Teilnehmer-Passwort“ entfällt. „Alle abmelden“ und „Cache leeren“ bleiben.
- **Systemstatus:**
  - „Teilnehmer-Passwort“ wird ersetzt durch „Admin-Zugang (ADMIN_USERNAME/ADMIN_PASSWORD)“.
  - Neu: „laufende Termine“.

## 7. Chat-Oberfläche

- **Login:** Felder „Benutzername“ und „Passwort“ mit passenden `autocomplete`-Werten.
  - Autofill und vor dem Laden Getipptes werden übernommen (wie jetzt schon).
  - Meldungen: „Benutzername oder Passwort stimmt nicht.“, „Dein Termin beginnt …“, „Dein Zugang ist abgelaufen.“
- **Seitenleiste:**
  - Gäste sehen keinen Admin-Link, dafür „Angemeldet als fuchs27 · gültig bis 16:30“.
  - Admins sehen „Admin“ wie heute.
- **Warnung vor dem Ende:** 10 Minuten vorher erscheint ein Hinweis mit Export-Knopf. Nach dem Ablauf führt die
  nächste Aktion zum Login mit Meldung, nichts bleibt hängen.
- **Verlauf pro Konto:**
  - Heute liegen alle Chats eines Browsers in einer gemeinsamen Datenbank.
  - Auf Schulungsrechnern würde der nächste Gast die Chats des vorigen sehen.
  - Künftig hat jedes Konto eine eigene Browser-Datenbank (`freebie-<Konto>`).
  - Beim Abmelden und beim Ablauf werden Gast-Chats auf dem Gerät gelöscht; vorher kommt der Export-Hinweis.
    Admin-Chats bleiben erhalten.

## 8. Was wegfällt oder sich ändert

| Heute | Künftig |
|---|---|
| Gemeinsames Passwort `APP_PASSWORD` bzw. im Admin gesetztes Teilnehmer-Passwort | entfällt – nur noch Gast-Konten pro Termin |
| Eigene Admin-Anmeldung unter `/admin` (2-Stunden-Cookie) | eine Anmeldung für alle, Rolle im Sitzungs-Token |
| `freebie_admin`-Cookie | entfällt |
| Statistik nur nach Sitzung | zusätzlich nach Rolle, Termin und Gruppe |

**Umstellung beim Deploy**

- Alle bestehenden Sitzungen werden ungültig (neues Token-Format).
- `APP_PASSWORD` kann aus Vercel entfernt werden.
- `ADMIN_USERNAME` ist optional (Standard `admin`).
- Gäste können sich erst anmelden, wenn ein Termin angelegt ist.

## 9. Tests – die Suite bleibt vollständig

**Fixtures (`tests/e2e/support`)**

- **`loginUser`:** legt über die Admin-API einen eigenen Gast im Test-Termin des Servers an (Termin von jetzt bis
  jetzt + 23 Stunden) und meldet ihn an.
  - Jeder Test bekommt so wie heute eine eigene Identität (neben der eigenen IP).
  - Alle bisherigen Chat-Tests laufen unverändert weiter, nur eben als Gast.
- **`openAdmin` / `AdminApi`:** melden sich über die gemeinsame Login-Seite als Admin an.
- **Rücksetzen nach Admin-Tests:** Snapshot und Restore umfassen auch Termine, Gruppen und Gäste. Der Test-Termin
  selbst bleibt bestehen.
- **Ablauf:** wird über „Jetzt beenden“ und über einen echten Kurztermin getestet (endet nach etwa 70 Sekunden, ein
  Test wartet). Es gibt keine Test-Hintertür im Produktionscode.

**Neue Katalog-IDs (Bereich T · Termine und Gäste)**

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| T01 | Termin anlegen, Prüfungen (Ende vor Beginn, über 24 h, Vergangenheit, leerer Name) | Termin in „Geplant“/„Läuft“, deutsche Meldungen |
| T02 | Gruppen anlegen, umbenennen, löschen (Bestätigung) | Löschen entfernt Gäste, deren Sitzungen enden |
| T03 | Gäste erzeugen, nachlegen, einzeln löschen, Passwort neu erzeugen | eindeutige, einfache Zugangsdaten; altes Passwort gilt nicht mehr |
| T04 | Druckansicht und CSV je Gruppe und Termin | alle Gäste mit Benutzername, Passwort, Gültigkeit |
| T05 | Termin verlängern bzw. verkürzen | wirkt auf bestehende Sitzungen und neue Anmeldungen |
| T06 | „Jetzt beenden“ | alle Gäste sind bei der nächsten Aktion abgemeldet, Anmeldung abgelehnt |
| T07 | Termin löschen | Gäste weg, Statistik bleibt |
| T08 | Mehrere Termine gleichzeitig, Reiter Läuft/Geplant/Vorbei | richtige Zuordnung und Sortierung |
| T09 | Gast meldet sich an (Groß-/Kleinschreibung, Leerzeichen) | nur Chat; kein Admin-Link; `/admin` → Login, `/api/admin/*` → 403 |
| T10 | Anmeldung vor Beginn bzw. ab 30 Minuten vorher | Meldung mit Startzeit bzw. Zugang |
| T11 | Termin endet während der Sitzung (Kurztermin) | nächste Aktion führt zum Login „abgelaufen“, Anmeldung danach abgelehnt |
| T12 | Hinweis „gültig bis“ und Warnung 10 Minuten vor Ende | Text, Export-Knopf |
| T13 | Zwei Gäste nacheinander am selben Gerät | keiner sieht die Chats des anderen; Abmelden/Ablauf löscht Gast-Chats |
| T14 | Login-Bremse pro Benutzername und pro IP | Sperre mit Meldung; andere Konten nicht betroffen; keine Namens-Ausspähung |
| T15 | Admin meldet sich an | Chat und Admin ohne zweite Anmeldung; Abmelden beendet beides |
| T16 | Kosten pro Termin und Gruppe | Übersicht zählt Gast-Anfragen richtig zu |
| T17 | Aufräumjob | löscht abgelaufene Gäste samt Zugangsdaten, Termine bleiben in der Statistik |
| T18 | API der Termine | 401 ohne Sitzung, 403 für Gäste, 400 mit deutscher Meldung, 404 für unbekannte IDs |

**Angepasste Katalog-IDs**

- **A01–A12 (Zugang):** auf Benutzername und Passwort umgestellt.
  - A06/A07 decken die Bremse jetzt pro IP ab, T14 die Bremse pro Name.
  - A11/A12 decken „Alle abmelden“ und das Ende eines Termins ab.
- **B (Hinweis):** gilt pro Konto.
- **O01 (Admin-Zugang):** geht in T15 auf. O04 deckt den neuen Systemstatus ab.
- **S01/S02 (Teilnehmer-Passwort):** entfallen und werden durch T03/T06 ersetzt. S03/S04 bleiben.
- **U (API):** Routenliste um die Termin-Routen erweitert, 403 für Gäste an Admin-Routen.
- **E07 (Verlauf):** zusätzlich „Verlauf pro Konto“.
- **X (Live-Smoke):**
  - meldet sich als Admin an.
  - legt einen Termin „Smoke“ mit 15 Minuten Laufzeit und einem Gast an.
  - prüft eine Frage als Gast.
  - beendet den Termin wieder.

**Absicherung**

- **Abdeckungsmatrix:** `coverage.json` bekommt die neuen Routen, Bedienelemente und Einstellungen. Der CI-Check
  verhindert Lücken.
- **Unit-Tests:**
  - Generator: Format, Eindeutigkeit, keine verwechselbaren Zeichen
  - Zeitfenster
  - Token-Ablauf
  - Verschlüsselung der Druckkopie
- **Fertig heißt:**
  - komplette Suite lokal dreimal hintereinander grün
  - CI grün in Chromium, WebKit und Firefox
  - Abdeckungsprüfung grün
  - `TESTPLAN.md` aktualisiert
  - keine Katalog-ID ohne Test

## 10. Umsetzung in Phasen

| Phase | Inhalt | Stand |
|---|---|---|
| 1 · Grundlage | Tabellen, Generator, Zeitfenster-Logik, Verschlüsselung – mit Unit-Tests | erledigt |
| 2 · Anmeldung | gemeinsame Login-Seite, Rollen-Token, Serverprüfung, Bremse pro Name, Admin ohne Extra-Login; Fixtures umstellen, A/O/S/U-Tests anpassen | erledigt |
| 3 · Termine im Admin | API und Oberfläche (Liste, Dialoge, Gruppen, Gäste, Druck, CSV, „Jetzt beenden“); T01–T08, T18 | erledigt |
| 4 · Chat | Gast-Hinweise, Warnung vor Ende, Verlauf pro Konto, Admin-Link nur für Admins; T09–T15 | erledigt |
| 5 · Statistik und Aufräumen | Kosten nach Termin/Gruppe, Aufräumjob; T16–T17 | erledigt |
| 6 · Abschluss | Live-Smoke, Doku (README, TESTPLAN), Stabilitätslauf, CI in drei Browsern | erledigt |

**Abweichungen bei der Umsetzung**

- **Sitzungsdauer:** Auch Gast-Sitzungen gelten 12 Stunden; das Termin-Ende prüft der Server bei jeder Anfrage
  (Chat-Seite und jede API). So bleiben Gäste angemeldet, wenn die Kursleitung einen laufenden Termin verlängert.
  Ein Token, das genau zum ursprünglichen Ende abläuft, hätte sie sonst trotzdem abgemeldet.
- **Ablauf im Chat:** Der Chat fragt alle 5 Minuten, in den letzten 10 Minuten bei jeder Prüfung, beim Server nach.
  Zum Ende führt er ohne Zutun zur Anmeldung („Dein Zugang ist abgelaufen.“); die Login-Seite löscht dann die
  Gast-Chats vom Gerät. Wird ein Termin nur verschoben, heißt es „Deine Sitzung ist beendet …“ und die Chats bleiben.
- **Kurztermin-Test:** T11 nutzt einen echten Termin von 25 Sekunden statt 70.

## 11. Bewusst nicht enthalten

- Namen oder E-Mail-Adressen von Gästen. Die Benutzernamen sind zufällig, damit bleiben keine personenbezogenen
  Daten im System.
- Kosten-Budgets pro Gast oder Termin (später möglich, da die Kosten pro Termin erfasst werden).
- Mehrere Admin-Konten (später möglich; das Datenmodell lässt Platz dafür).

## 12. Entscheidungen, die ich von dir brauche

Jeweils mit meiner Empfehlung:

1. **Gemeinsames Teilnehmer-Passwort abschaffen** und nur noch Gast-Konten pro Termin. *Empfehlung: ja*, ein klares
   Modell statt zwei Wegen.
2. **Termin-Länge:** höchstens 24 Stunden ab Beginn (auch über Mitternacht). *Empfehlung: ja*. Die Alternative wäre
   „innerhalb eines Kalendertags“.
3. **Anmeldung ab 30 Minuten vor Beginn**, damit Rechner vorbereitet werden können. *Empfehlung: ja*. Die
   Alternative wäre „erst ab Beginn“.
4. **Gast-Chats beim Abmelden und Ablauf vom Gerät löschen**, mit Export-Hinweis 10 Minuten vorher.
   *Empfehlung: ja*, wegen gemeinsam genutzter Schulungsrechner.
5. **Format der Zugangsdaten:** Benutzername `fuchs27`, Passwort `sonne482`. *Empfehlung: ja*. Kürzer ginge auch
   (z. B. vierstellige PIN), wäre aber deutlich leichter zu erraten.
6. **Admin-Sitzung 12 Stunden** ohne zweite Anmeldung für den Admin-Bereich. *Empfehlung: ja*. Heute gilt der
   Admin-Zugang nur 2 Stunden. Wer den ganzen Schulungstag im Chat ist, müsste sich sonst mehrmals neu anmelden.
7. **Aufbewahrung:** Gast-Konten samt Passwörtern werden mit dem Termin-Ende gelöscht, Termine mit ihren Kosten
   bleiben 90 Tage in der Statistik. *Empfehlung: ja*.
