import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { CommonUiModule } from "src/app/shared/common-ui.module";
import { environment } from "src/environments";
import { Service } from "../../../shared/shared";
import { Role } from "../../../shared/type/role";
import { App, Changelog, Library, OpenemsComponent, Product } from "./changelog.constants";

@Component({
    selector: "changelog",
    templateUrl: "./changelog.component.html",
    standalone: true,
    imports: [CommonUiModule],
})
export class ChangelogComponent {

    public environment = environment;

    public readonly roleIsAtLeast = Role.isAtLeast;
    public readonly changelogs: {
        title?: string,
        version?: string,
        changes: Array<string | { roleIsAtLeast: Role, change: string }>
    }[] =
        [
            {
                version: "2025.12.2",
                changes: [
                    "PV-Erzeugungsprognose: Allgemeine Verbesserungen, Einführung einer automatischen Schnee-Erkennung",
                    "Anpassungen an den neuen FENECON-Markenauftritt: Mehr dazu auf www.fenecon.de",
                    "Verbesserungen am Inbetriebnahmeassistent",
                    "Verbesserung der Barrierefreiheit gemäß WCAG (Web Content Accessibility Guidelines)",
                    "Fehlerbehebungen in der Seiten-Navigation und bei Diagrammen mit mehreren Y-Achsen",
                    "FEMS App clever-PV: Fehlerbehebungen",
                    { roleIsAtLeast: Role.INSTALLER, change: "FENECON Industrial S und L: Einführung eines Reset-Buttons" },
                    { roleIsAtLeast: Role.INSTALLER, change: "FENECON Industrial L: Kompatibilität mit Würth Batteriemanagementsystem" },
                    { roleIsAtLeast: Role.ADMIN, change: "Start Rollout der neuen KI-Verbrauchsprognose" },
                ],
            },
            {
                version: "2025.12.1",
                changes: [
                    "Anpassungen an den neuen FENECON-Markenauftritt: Mehr dazu auf www.fenecon.de",
                    Changelog.app(App.METER, App.SHELLY_DIY) + "Neue, kostenlose \"FEMS App Shelly DIY\" zur Anbindung der smarten Shelly Plug S als Erzeugungs- oder Verbrauchszähler - z. B. für Balkon-PV, Waschmaschine, etc.",
                ],
            },
            {
                version: "2025.11.4",
                changes: [
                    Changelog.UI,
                    "Optimierung der Regelgeschwindkeit in Multi-Use-Anwendungen",
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.app(App.ENERIX_CONTROL) + "Zusätzlicher Modus zur Beladung des Speichers aus dem Netz" },
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.app(App.METER, App.SHELLY_DIY) + "Installierbar für ADMINs, bald kostenlos für alle" },
                ],
            },
            {
                version: "2025.11.3",
                changes: [
                    Changelog.UI + "Anzeige des Ladezustands im Energiemonitor, Verbesserung der Barrierefreiheit gemäß WCAG (Web Content Accessibility Guidelines)",
                    Changelog.app(App.MODBUS_TCP_API) + "Verbesserte Stabilität bei Verbindungsabbrüchen (Timeout)",
                    Changelog.library(Library.J2MOD, Library.JSERIALCOMM),
                ],
            },
            {
                version: "2025.11.2",
                changes: [
                    Changelog.app(App.EVCS_AC, App.HARDY_BARTH) + "Fehlerbehebungen",
                    Changelog.app(App.TIME_OF_USE, App.OCTOPUS_HEAT, App.OCTOPUS_GO) + "Kompatibilität mit zeitvariablen Netzentgelten nach §14a Modul 3 EnWG",
                ],
            },
            {
                version: "2025.11.1",
                changes: [
                    Changelog.openems("2025.11.0"),
                    Changelog.UI,
                    Changelog.app(App.EVCS_AC, App.HARDY_BARTH) + "Verbesserungen bei Unterbrechung des Ladevorgangs",
                    { roleIsAtLeast: Role.INSTALLER, change: "Inbetriebnahmeassistent: Bessere Erklärung der Funktion \"Externe limitierung\" | \"Dynamischer Rundsteuerempfänger\"" },
                    Changelog.library(Library.OKHTTP, Library.APACHE_FELIX_HTTP_JETTY),
                ],
            },
            {
                version: "2025.10.2",
                changes: [
                    Changelog.UI,
                    "FEMS App Wetter: Schrittweise Einführung der Wettervorhersage sowie einer optimierten, wetterbasierten Erzeugungsprognose",
                    Changelog.app(App.TIME_OF_USE, App.ENTSO_E) + "Aktualisierung auf geänderte API-Schnittstelle von ENTSO-E",
                    Changelog.library(Library.OKHTTP, Library.APACHE_FELIX_HTTP_JETTY),
                ],
            },
            {
                version: "2025.10.1",
                changes: [
                    Changelog.openems("2025.10.0"),
                    Changelog.UI + "Links zur Dokumentation in Apps eingefügt, Stabilere Aktualisierung der Daten",
                    Changelog.app(App.TIME_OF_USE, App.LUOX_ENERGY) + "Kompatibilität mit LUOX Dynamisch",
                    Changelog.app(App.TIME_OF_USE, App.ENTSO_E) + "Umstellung der Standardeinstellung auf 15-Minuten-Werte",
                    Changelog.app(App.METER, App.PQ_PLUS) + "Kompatibilität mit den PQ Plus Zählern UMD 96 und UMD 97",
                    { roleIsAtLeast: Role.INSTALLER, change: "Inbetriebnahmeassistent: Einführung der Auswahloption \"Externe limitierung\" | \"Dynamischer Rundsteuerempfänger\"" },
                    Changelog.app(App.PV_INVERTER, App.SOLAREDGE) + "Einstellbarkeit der Modbus Unit-ID",
                    Changelog.library(Library.ANGULAR),
                ],
            },
            {
                version: "2025.9.4",
                changes: [
                    "Einführung der Funktion \"Dynamischer Rundsteuerempfänger\" über die FEMS-Anschlussbox für Home 20, 30 & Commercial 50. Ermöglicht die Abregelung am Netzanschlusspunkt statt direkt an der Erzeugungsanlage",
                    Changelog.app(App.TIME_OF_USE, App.ANCILLARY_COSTS) + "Öffentliche Verfügbarkeit",
                ],
            },
            {
                version: "2025.9.3",
                changes: [
                    "FENECON Home: Verbesserte Leistungsvorgaben in den Grenzbereichen für Be-/Entladung",
                    Changelog.app(App.EVCS_AC) + "Fehlerbehebung bei Verbrauchswidget: Wallboxen wurden doppelt angezeigt",
                    { roleIsAtLeast: Role.INSTALLER, change: "Inbetriebnahmeassistent: Fehlerbehebung der Seriennummernvalidierung bei Extension Box" },
                ],
            },
            {
                version: "2025.9.2",
                changes: [
                    Changelog.product(Product.COMMERCIAL_50) + "Auslieferstart und Integration im Inbetriebnahmeassistenten",
                    Changelog.app(App.TIME_OF_USE, App.TIBBER) + "Umstellung auf 15-Minuten-Werte zum 01. Oktober 2025",
                    { roleIsAtLeast: Role.ADMIN, change: "Rundsteuerempfänger: Netzeinspeisung wird über digitale Eingänge auf 0%, 30%, 60%, oder auf maximale Netzeinspeisung reduziert" },
                ],
            },
            {
                version: "2025.9.1",
                changes: [
                    Changelog.openems("2025.9.0"),
                    Changelog.UI,
                    "Optimierung der Keyboardnavigation gemäß WCAG (Web Content Accessibility Guidelines)",
                    { roleIsAtLeast: Role.INSTALLER, change: "Im Inbetriebnahmeassistent ist die Auswahl für den Cos µ Festwert nun auf Werte zwischen (-)0,9 und (-)0,99 limitiert" },
                    { roleIsAtLeast: Role.INSTALLER, change: Changelog.product(Product.COMMERCIAL_50) + "Verfügbarkeit des Inbetriebnahmeassistenten" },
                    { roleIsAtLeast: Role.ADMIN, change: "GoodWe Wechselrichter & Netzdienliche Beladung: Vereinheitlichung der maximal festgelegten Netzeinspeisung in der Meta App. Bereits gesetzte Werte werden in die Meta App übernommen." },
                    { roleIsAtLeast: Role.ADMIN, change: "Verbesserungen an neuer EVSE-Architektur für Ladesäulen" },
                ],
            },
            {
                version: "2025.8.2",
                changes: [
                    "KACO Batteriewechselrichter: Verbesserte Darstellung von Statusmeldungen",
                    Changelog.app(App.TIME_OF_USE, App.ENTSO_E) + "Variable Netzentgelte: Verbesserungen im Eingabeformular für Preisblätter",
                    Changelog.app(App.TIME_OF_USE) + "Verbesserungen im Betrieb ohne PV-Anlage",
                    Changelog.app(App.EVCS_AC) + "Verbesserungen in der historischen Darstellung",
                ],
            },
            {
                version: "2025.8.1",
                changes: [
                    Changelog.openems("2025.8.0"),
                    Changelog.app(App.EVCS_AC, App.KEBA) + "(P40) Warnung bei inkompatibler Firmware-Version unter 1.2.2",
                    "FENECON Home: Einstellungen | Energy Journey. Simulation der Einsparungen durch einer Batterieerweiterung",
                    { roleIsAtLeast: Role.INSTALLER, change: "FENECON Home im App Center: Verbesserung der Netzeinstellungen" },
                    Changelog.app(App.POWER_TO_HEAT) + "Umbenennung der Heizstab-Apps 'my-PV lesend' und 'ASKOMA lesend'",
                    { roleIsAtLeast: Role.ADMIN, change: "FENECON Industrial: FEMS App Hochlastzeitfenster über App Center installierbar" },
                    { roleIsAtLeast: Role.ADMIN, change: "Einstellungen | Channels: Auswahlmöglichkeit für mehrere Channels einer Komponente gleichzeitig" },
                ],
            },
            {
                version: "2025.7.4",
                changes: [
                    Changelog.app(App.EVCS_AC, App.KEBA) + "(P40) Korrektur der Energiewerte bei Firmware-Versionen unter 1.1.9",
                    Changelog.app(App.EVCS_AC_LESEND, App.GO_E) + "Einbindung der Wallbox go-e Charger Gemini flex (nur lesend))",
                    Changelog.app(App.SCHWELLWERTSTEUERUNG) + "Fehlerbehebung in der Darstellung",
                    { roleIsAtLeast: Role.ADMIN, change: "Einstellungen | System: Firmware-Update für GoodWe Batteriewechselrichter" },
                    { roleIsAtLeast: Role.ADMIN, change: "Inbetriebnahmeassistent: Litauen kann als Installations-/Kundenadresse angegeben werden" },
                    { roleIsAtLeast: Role.ADMIN, change: "Verbesserungen an neuer EVSE-Architektur für Ladesäulen" },
                    { roleIsAtLeast: Role.ADMIN, change: "UI Neue Navigation: aktivierbar für ADMINs im Benutzerprofil" },
                ],
            },
            {
                version: "2025.7.3",
                changes: [
                    Changelog.UI,
                    Changelog.app(App.POWER_TO_HEAT) + "Fehlerbehebung bei gemessenem Heizstab",
                ],
            },
            {
                version: "2025.7.2",
                changes: [
                    "FENECON Home: Verbessertes Verhalten mit aktiver Blindleistungseinstellung Q(U)",
                    Changelog.app(App.EVCS_AC) + "Allgemeine Verbesserungen und Fehlerbehebungen",
                    Changelog.app(App.EVCS_AC, App.KEBA) + "Fehlerbehebung doppeltes Anstecken mit Multiladepunkt-Management, Umstellung zwischen lesendem und schreibendem Modus im App Center, Verbesserungen für KEBA P40",
                    Changelog.app(App.POWER_TO_HEAT_LESEND, App.MY_PV, App.ASKOMA) + "Veröffentlichung der Apps für Askoma ASKOHEAT+ und AC•THOR 9s",
                    Changelog.app(App.PV_INVERTER, App.SOLAREDGE) + "Fehlerbehebung bei Kompatibilität mit dem Modbus/SunSpec-Protokoll von SolarEdge",
                    Changelog.app(App.PEAKSHAVING) + "Verbesserung der historischen Darstellung",
                    Changelog.app(App.METER, App.EASTRON_SDM630) + "Veröffentlichung der App für den Eastron SDM630 Verbrauchs- und Erzeugungszähler",
                    Changelog.app(App.TIME_OF_USE, App.ENTSO_E) + "Variable Netzentgelte in Deutschland nach §14a EnWG Modul 3 sind jetzt im App Center aktivierbar",
                    { roleIsAtLeast: Role.ADMIN, change: "Einstellungen | Anlagenprofil: Verbesserung des Excel-Exports aller Channels" },
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.product(Product.COMMERCIAL_50) + "Technischer Unterbau und Vorbereitungen in FEMS" },
                ],
            },
            {
                version: "2025.7.1",
                changes: [
                    Changelog.openems("2025.7.0"),
                    Changelog.app(App.POWER_TO_HEAT) + "Fehlerbehebung beim Slider zur Konfiguration der Energie",
                    Changelog.app(App.POWER_TO_HEAT_LESEND, App.MY_PV, App.ASKOMA) + "Heizenergie wird nun richtig im Verbrauch angezeigt",
                    "Einstellungen | Netzwerkkonfiguration: die aktuell zugewiesene DHCP-Adresse wird in der Netzwerkkonfiguration dargestellt.",
                    "Android App: Anpassen der Fensterhöhe bei aktivierter Android-Navigationsleiste",
                    Changelog.app(App.EVCS_AC, App.HARDY_BARTH) + "Fehlerbehebung bei der Umstellung zwischen lesendem und schreibendem Modus im App Center",
                    { roleIsAtLeast: Role.INSTALLER, change: "Einstellungen | Netzwerkkonfiguration ist jetzt für Rolle 'OWNER' sichtbar" },
                    { roleIsAtLeast: Role.ADMIN, change: "Modbus/TCP Schreibzugriff: erlaubt optional dynamisches Setzen der Ziel-Leistung am Netzanschlusspunkt über Eigenverbrauchsoptimierungs-Controller" },
                    { roleIsAtLeast: Role.ADMIN, change: "Neuer Vorhersagealgorithmus für Erzeugung auf Basis historischer Daten und Wetterprognose: Start Feldtest" },
                    {
                        roleIsAtLeast: Role.ADMIN,
                        change: "Zeitvariable Netzentgelte für ENTSO-E: Preisblätter für Bayernwerk, Netze BW, EWE Netz, MITNETZ, SH Netz, Westnetz, E.DIS, Avacon, "
                            + "LEW, TE Netz verfügbar und durch ADMIN konfigurierbar. Auswahlfeld im App Center folgt.",
                    },
                    {
                        roleIsAtLeast: Role.ADMIN,
                        change: "Neuer Channel '_sum/UnmanagedProductionActivePower': dieser bildet zukünftig die theoretisch mögliche, nicht abgeregelte "
                            + "PV-Erzeugungsleistung ab als Grundlage für Prognosen und das Lastmanagement. Vorerst identisch zu '_sum/ ProductionActivePower'",
                    },
                    { roleIsAtLeast: Role.ADMIN, change: "Verbesserungen an neuer EVSE-Architektur für KEBA, Hardy-Barth und Online-Monitoring" },
                ],
            },
            {
                version: "2025.6.3",
                changes: [
                    "App Center: Fehlerbehebung bei der Deinstallation von Apps",
                    "Android App: Anpassen der Fensterhöhe bei aktivierter Android-Navigationsleiste",
                    Changelog.app(App.EVCS_AC) + "Fehlerbehebung bei 'Minimale Beladung garantieren', Anpassung der Hilfe-Links",
                    { roleIsAtLeast: Role.INSTALLER, change: "Home Inbetriebnahmeassistent Netzeinspeiselimitierung: neue Auswahlmöglichkeit 'Dynamische Einspeisung & Externe Limitierung' gleichzeitig" },
                    { roleIsAtLeast: Role.INSTALLER, change: "Home Inbetriebnahmeassistent Blindleistungsvorgabe: Änderung der Voreinstellung von Q(U) zu statischem Leistungsfaktor cos φ 1" },
                    { roleIsAtLeast: Role.ADMIN, change: "Home Batteriewechselrichter: SolarGo Register werden nicht länger gelesen, wenn diese nicht verfügbar sind." },
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.app(App.POWER_TO_HEAT_LESEND, App.MY_PV, App.ASKOMA) + "Heizenergie wird nun korrekt von 'Sonstiger Verbrauch' abgezogen, Fehlerbehebung bei der Darstellung von Daten in Historie" },
                    { roleIsAtLeast: Role.ADMIN, change: "Industrial L: Unterstützung für neue Würth-BMS Version (BETA); weitere Verbesserungen folgen" },
                    { roleIsAtLeast: Role.ADMIN, change: "Industrial L Service-Assistant: Button zum Reset des Timeout-Memory" },
                    { roleIsAtLeast: Role.ADMIN, change: "AppCenter: Info, welche Rolle benötigt wird um eine App zu sehen" },
                ],
            },
            {
                version: "2025.6.2",
                changes: [
                    Changelog.UI,
                    Changelog.app(App.EVCS_AC, App.KEBA) + "Fehlerbehebungen in der App für KEBA P40",
                    "FEMS App clever-PV: Anbindung an die clever-PV Push-Api",
                    { roleIsAtLeast: Role.INSTALLER, change: "Erweiterung der aktiven Benachrichtigungsfunktion durch E-Mail: bei Gesamtzustand \"Fehler\"" },
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.app(App.POWER_TO_HEAT_LESEND, App.MY_PV, App.ASKOMA) + "Start des öffentlichen Feldtests" },
                    { roleIsAtLeast: Role.ADMIN, change: "Hinzufügen der SolarGo Statusinformationen für interne Analysen" },
                    { roleIsAtLeast: Role.ADMIN, change: "Interne Tests: Vorbereitung für PV-Prognose mit Open-Meteo Wetter-Api, Standort-Koordinaten in _meta" },
                ],
            },
            {
                version: "2025.6.1",
                changes: [
                    Changelog.openems("2025.6.0"),
                    Changelog.UI,
                    Changelog.app(App.EVCS_AC, App.KEBA) + "Fehlerbehebungen in der App für KEBA P40",
                    Changelog.product(Product.INDUSTRIAL_L) + "Anpassung der SoC-Anzeige im hohen und niedrigen Bereich",
                    Changelog.product(Product.HOME_20_30) + "Unterstützung für größere Leistungen am Netzzähler",
                    "KACO Batteriewechselrichter: Verbesserungen bei der Initialisierung",
                    { roleIsAtLeast: Role.ADMIN, change: "Interne Tests: neue UI-Navigation, EVSE KEBA UDP und Modbus/TCP, Heidelberg Connect" },
                ],
            },
            {
                version: "2025.5.3",
                changes: [
                    Changelog.UI + "Fehlerbehebung bei Inbetriebnahme von Home Systemen",
                ],
            },
            {
                version: "2025.5.2",
                changes: [
                    Changelog.UI + "Fehlerbehebung bei der Darstellung von Daten",
                ],
            },
            {
                version: "2025.5.1",
                changes: [
                    Changelog.openems("2025.5.0"),
                    Changelog.UI + "Verbesserung der Farben in Hell-/Dunkelmodus; historische Darstellungen, Verhalten bei Verbindungsabbruch",
                    Changelog.app(App.EVCS_AC, App.KEBA) + "Verbesserungen für KEBA P40",
                    Changelog.app(App.EVCS_AC, App.HARDY_BARTH) + "Möglichkeit zur Umschaltung auf nur-lesenden Betrieb",
                    Changelog.app(App.TIME_OF_USE, App.OCTOPUS_HEAT) + "Fehlerbehebung bei der App-Installation",
                    Changelog.product(Product.COMMERCIAL_92) + "Verbesserungen am Inbetriebnahmeassistent (§14a EnWG, Clustersystem mit Master-Slave-Betrieb)",
                    Changelog.product(Product.INDUSTRIAL_L) + "Verbesserungen an der Systemstart-Prozedur",
                    Changelog.product(Product.INDUSTRIAL_S) + "Verbesserung der Spannungsregelung",
                    { roleIsAtLeast: Role.ADMIN, change: "Zeitvariable Netzentgelte sind intern für ENTSO-E konfigurierbar; Unterstützung im App Center folgt" },
                    { roleIsAtLeast: Role.ADMIN, change: "Modbus-Tabelle: Register für MAX_APPARENT_POWER bei SymmetricEss" },
                    { roleIsAtLeast: Role.ADMIN, change: "Von OpenEMS: Kompatibilität mit Janitza UMG104" },
                    { roleIsAtLeast: Role.ADMIN, change: "Interne Tests: EVSE, Energy-Scheduler v2 inkl. DISCHARGE_TO_GRID" },
                    Changelog.library(Library.JENETICS, Library.GUAVA, Library.GSON, Library.OKIO, Library.APACHE_FELIX_HTTP_JETTY, Library.FASTEXCEL),
                ],
            },
            {
                version: "2025.4.3",
                changes: [
                    Changelog.UI,
                    Changelog.app(App.EVCS_AC, App.KEBA) + "Lesende Unterstützung für KEBA P40 via Modbus/TCP (Fehlerbehebung)",
                    Changelog.product(Product.INDUSTRIAL_L) + "Erweiterung der nutzbaren Batterieleistung zwischen 5 bis 95 % SoC, dynamische Berechnung der Spannungsgrenzen für Be- und Entladung",
                    { roleIsAtLeast: Role.ADMIN, change: "ESS Leistungsverteilung: OPTIMIZE_BY_KEEPING_ALL_NEAR_EQUAL" },
                ],
            },
            {
                version: "2025.4.2",
                changes: [
                    Changelog.UI + "Verbesserung der Farben in Hell-/Dunkelmodus; Kompatibilitätsverbesserungen mit iOS und Android; Bugfix bei historischer Darstellung des Direktverbrauchs, Bei Anlegen eines Benutzeraccounts: Verweis auf <a href='https://erp.fenecon.de/fenpost' target='_blank'>Newsletter-Anmeldeformular mit Double-Opt-In</a>;",
                    Changelog.product(Product.COMMERCIAL_92) + "Verbesserungen am Inbetriebnahmeassistent für Master-Slave-Betrieb",
                    Changelog.app(App.MODBUS_TCP_API) + "Fehlerbehebung bei der Initialisierung der Register-Tabelle",
                    Changelog.app(App.EVCS_AC, App.HARDY_BARTH) + "Verbesserte Kompatibilität mit RFID-Authentifizierung",
                    Changelog.app(App.EVCS_AC, App.KEBA) + "Lesende Unterstützung für KEBA P40 via Modbus/TCP",
                    Changelog.app(App.EVCS_AC_LESEND, App.MENNEKES) + "Korrekte Darstellung historischer Energiewerte",
                    Changelog.app(App.TIME_OF_USE) + "Neuer unterstützter Stromtarif: FEMS App Octopus Heat",
                    { roleIsAtLeast: Role.ADMIN, change: "Neue Komponente '_serialNumber' speichert Seriennummern von FENECON Home Batterien und Wechselrichter" },
                    { roleIsAtLeast: Role.ADMIN, change: "Verbesserungen für Master-Slave-Betrieb: Einstellung für Firewall-Forwarding, Edge2Edge via Websocket" },
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.app(App.EVCS_AC, App.KEBA) + "Schreibende Unterstützung für KEBA P40 via Modbus/TCP aktivierbar für Admins (BETA-Test)" },
                    { roleIsAtLeast: Role.ADMIN, change: "Interne App 'Meta' ist nur noch für Admin sichtbar" },
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.app(App.NETZDIENLICHE_BELADUNG_INDUSTRIAL) + "Fehlerbehebung für große Commercial- oder Industrial-Systeme" },
                    Changelog.library(Library.PAX_LOGGING),
                ],
            },
            {
                version: "2025.4.1",
                changes: [
                    Changelog.openems("2025.4.0"),
                    Changelog.UI + "Ein-/Ausblenden Monats- und Jahresansicht, Übersetzungsfehler korrigiert",
                    Changelog.app(App.REST_JSON_API) + "Fehlerbehebung bei der Verarbeitung regulärer Ausdrücke",
                    Changelog.app(App.MODBUS_TCP_API) + "Darstellung der Historie ist wieder verfügbar",
                    "Erweiterung des Excel-Exports aus der historischen Ansicht",
                    "Zähler-Apps: bei allen Zähler-Apps kann im App Center 'Invertierung' aktiviert werden, um Zählerwerte zu invertieren",
                ],
            },
            {
                version: "2025.3.2",
                changes: [
                    Changelog.UI,
                    Changelog.app(App.TIME_OF_USE) + "FEMS App Octopus Go: Korrektur der Preisberechnung",
                    Changelog.app(App.TIME_OF_USE) + "Verbesserung der Regelgeschwindigkeit bei aktiver Beladung aus dem Netz mit limitierter Leistung am Netzanschlusspunkt",
                    Changelog.app(App.MODBUS_TCP_API) + "Fehler 'Invalid Modbus Call' wird nach 60 Sekunden automatisch bereinigt",
                    "Multiladepunktmanagement: Verbesserung der Angabe der maximalen Gesamtleistung im App Center",
                    { roleIsAtLeast: Role.ADMIN, change: "FEMS App enerixControl" },
                    { roleIsAtLeast: Role.ADMIN, change: "Einstellungen | Industrial L Service Assistent: Verbesserungen" },
                    { roleIsAtLeast: Role.ADMIN, change: "Vorbereitungen für IPv4Forwarding und IPMasquerade für Master-/Slave-Systeme" },
                    { roleIsAtLeast: Role.ADMIN, change: "Vorbereitungen für Neustart eines Speichersystems nach 'battery timeout passed'" },
                ],
            },
            {
                version: "2025.3.1",
                changes: [
                    Changelog.UI,
                    Changelog.product(Product.COMMERCIAL_92) + "Verbesserungen am Inbetriebnahmeassistent",
                    Changelog.app(App.TIME_OF_USE) + "ENTSO-E Börsenstromindex: Verbesserte Fehlertoleranz bei unvollständigen Preissignalen",
                    Changelog.app(App.TIME_OF_USE) + "rabot.charge: Korrektur der Bruttopreis-Berechnung",
                    Changelog.app(App.TIME_OF_USE) + "Neuer unterstützter Stromtarif: FEMS App Octopus Go",
                    Changelog.app(App.TIME_OF_USE) + "Einstellung für maximalen Netzbezug durch Speicherbeladung im App Center",
                    Changelog.app(App.POWER_TO_HEAT, App.WAERMEPUMPE) + "Korrektur der Tooltip-Beschreibung in der Historie",
                    { roleIsAtLeast: Role.INSTALLER, change: Changelog.product(Product.HOME_10, Product.HOME_20_30, Product.HOME_6_10_15) + "Verbesserung bei Bestimmung der Anzahl der Batterietürme; Fehlerbehebung bei GoodWe 'SoC-Protect', verbessert Verhalten bei leerer/voller Batterie; Vermeidung von Tiefenentladung: zuverlässigere, frühzeitige Abschaltung der Batterie bei niedriger Zellspannung" },
                ],
            },
            {
                version: "2025.2.3",
                changes: [
                    Changelog.UI,
                    Changelog.app(App.EVCS_AC, App.KEBA) + "Fehlerbehebung: Ladelimit erreicht, wenn kein Ladelimit eingestellt ist",
                    "Lokales Monitoring: Einstellung für Hell-/Dunkelmodus dauerhaft speichern",
                    "Batterieerweiterung: Fehlerbehebung bei Einstellung des geplanten Startzeitpunktes",
                    { roleIsAtLeast: Role.INSTALLER, change: "Online-Monitoring Übersicht alle Systeme: Filter für Produkt-Typ und Systemzustand" },
                ],
            },
            {
                title: "Online-Monitoring (19.02.2025)",
                changes: [
                    Changelog.UI,
                ],
            },
            {
                version: "2025.2.2",
                changes: [
                    Changelog.UI + "Freischaltung Dunkelmodus (Dark Mode), Verbesserung in der historischen Jahresansicht",
                    { roleIsAtLeast: Role.INSTALLER, change: "FENECON Home und Commercial 92: Verbesserungen am IBN-Assistent" },
                    { roleIsAtLeast: Role.ADMIN, change: "FENECON Home: Korrektur eines Anzeigefehlers in der Historie bei niedrigen Leistungen (Totband erweitert)" },
                    { roleIsAtLeast: Role.ADMIN, change: "Controller für Clever-PV / enerixControl Push-API (BETA-Test; installierbar durch Admin)" },
                    { roleIsAtLeast: Role.ADMIN, change: "Industrial L: Warnung bei veralteter BMS Firmware" },
                    { roleIsAtLeast: Role.ADMIN, change: "E-Mobility: Test für KEBA P40 mit neuer Softwarearchitektur" },
                    { roleIsAtLeast: Role.ADMIN, change: "Dynamischer Stromtarif rabot.charge: Update der Zugangsdaten" },
                ],
            },
            {
                version: "2025.2.1",
                changes: [
                    Changelog.app(App.TIME_OF_USE) + "Kritischen Fehler behoben. Dieser führte dazu, dass verzögerte Entladung und aktive Beladung aus dem Netz seit 2025.1.2 nicht funktionierten",
                    { roleIsAtLeast: Role.INSTALLER, change: "App Center: Verbesserungen bei der Installation der Schwellwertsteuerung" },
                    Changelog.library(Library.APACHE_FELIX_HTTP_JETTY),
                ],
            },
            {
                version: "2025.1.2",
                changes: [
                    Changelog.UI + "Verbesserungen an FEMS App Heizstab und FEMS App Modbus/TCP Api, Darstellungen in Historie, Multiladepunktmanagement",
                    "Notstromreserve: verbessertes Verhalten bei Beladung aus dem Netz",
                    Changelog.app(App.PV_INVERTER, App.FRONIUS) + "lese exakte Stromwerte (allgemeine Verbesserung bei SunSpec Gleitkommazahlen)",
                    Changelog.app(App.EVCS_AC_LESEND, App.MENNEKES) + "Einbindung der Mennekes Amtron Professional (nur lesend))",
                    { roleIsAtLeast: Role.INSTALLER, change: "FENECON Home: Korrektur eines Anzeigefehlers in der Historie bei niedrigen Leistungen" },
                    { roleIsAtLeast: Role.INSTALLER, change: "FENECON Home: Fehlerbehebung bei den Einstellungen zur Blindleistung" },
                    { roleIsAtLeast: Role.ADMIN, change: "App Center: App zum Einstellen von globalen Systemeinstellungen. Derzeit: Speicher-Beladung aus dem Netz erlaubt? Lokale Währung" },
                    { roleIsAtLeast: Role.ADMIN, change: "App Center: Fehlerbehebung bei Listeneinstellungen" },
                    { roleIsAtLeast: Role.ADMIN, change: "Netzwerkkonfiguration: Vorarbeiten zur Verbesserung der Auslese- und Konfigurationsmöglichkeiten" },
                    { roleIsAtLeast: Role.ADMIN, change: "Industrial M: Verbesserung an der Systemkomponente" },
                ],
            },
            {
                version: "2025.1.1",
                changes: [
                    Changelog.openems("2025.1.0"),
                    Changelog.UI + "Login-Formular",
                    Changelog.app(App.EVCS_AC, App.HARDY_BARTH) + "Fehlerbehebung bei Ladeabbrüchen",
                    Changelog.app(App.MODBUS_TCP_API) + "Bessere Beschreibung der Datenpunkte im Excel-Export",
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.app(App.EVCS_AC, App.KEBA) + "KEBA: Setze Session-Energy-Wert im abgesteckten Status (nur ADMIN)" },
                    { roleIsAtLeast: Role.ADMIN, change: "App für Modbus/RTU-Api Read-Write und ReadOnly (installierbar durch Admin)" },
                    { roleIsAtLeast: Role.ADMIN, change: "Weidmüller I/O System: Unterstützung für Digital-Eingangsmodul UR20-16DI-P" },
                    Changelog.library(Library.ANGULAR, Library.NG2_CHARTS, Library.NGX_COOKIE_SERVICE, Library.NGX_SPINNER, Library.JENETICS, Library.JNA, Library.GRADLE, Library.OKIO),
                ],
            },
            {
                version: "2024.12.3",
                changes: [
                    "Live | Speichersystem: neue Einstellung um Notstromreserve aktiv aus dem Netz zu beladen",
                    Changelog.app(App.TIME_OF_USE) + "Darstellung in der historischen Ansicht verbessert: bessere Sichtbarkeit der niedrigsten Tagespreise",
                    { roleIsAtLeast: Role.INSTALLER, change: Changelog.app(App.EVCS_AC_LESEND, App.MENNEKES) + "Einbindung der Mennekes Amtron Professional (nur lesend))" },
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.UI + "Verbesserungen am Dark Mode" },
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.app(App.EVCS_AC) + "Angleichung der Statusmeldungen an Standard: Entfernen des Status 'Auto ist voll'" },
                    Changelog.library(Library.JAVA_JRE, Library.BNDTOOLS, Library.PAX_LOGGING),
                ],
            },
            {
                version: "2024.12.2",
                changes: [
                    Changelog.UI + "kleine Farbanpassungen in Vorbereitung auf einen Dunkelmodus (Dark Mode)",
                    Changelog.app(App.TIME_OF_USE) + "Verbesserung des Verhaltens bei Beladung aus dem Netz, Fehlerbehebung in der Diagramm-Darstellung",
                    { roleIsAtLeast: Role.INSTALLER, change: "Inbetriebnahmeassistent: Auswahloption für Installation in Griechenland" },
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.app(App.EVCS_AC_LESEND, App.MENNEKES) + "Implementierung der Mennekes Amtron Professional (nur lesend, nur installierbar durch ADMIN)" },
                    { roleIsAtLeast: Role.ADMIN, change: "Erzeugungs-/Verbrauchsprognose: Fehlerbehebung wenn lokale Daten fehlen (nur ADMIN)" },
                    { roleIsAtLeast: Role.ADMIN, change: "Benutzer | Allgemeine Einstellungen | Theme: Light (=heller Modus), Dark (=dunkler Modus) oder System (=Betriebssystemeinstellung)" },
                ],
            },
            {
                version: "2024.12.1",
                changes: [
                    Changelog.openems("2024.12.0"),
                    Changelog.UI,
                    Changelog.app(App.TIME_OF_USE, App.ENTSO_E) + "Konfigurierbare Auflösung (Viertelstunden-/Stundenpreise); Fehlerbehebung beim Abrufen der Preise",
                    "App Center: Warnhinweis beim Deinstallieren einer App",
                    Changelog.app(App.METER, App.CARLO_GAVAZZI) + "Korrektur der Skalierung des Strom-Wertes in Ampere",
                    { roleIsAtLeast: Role.INSTALLER, change: "Inbetriebnahmeassistent: Fehlerbehebungen; Validierung der eingegebenen PLZ" },
                    { roleIsAtLeast: Role.INSTALLER, change: Changelog.app(App.MODBUS_TCP_SCHREIBZUGRIFF) + "Fehlerbehebung nach Änderung der Konfiguration im laufenden Betrieb" },
                    { roleIsAtLeast: Role.ADMIN, change: "Online-Monitoring: Anzeige System-Status auch bei unkonfiguriertem EMS, Darstellung Netz-Strom ohne Vorzeichen (Be-/Entladung)" },
                    { roleIsAtLeast: Role.ADMIN, change: "Siemens SICAM T 7KG966 Zähler: Rückportierung aus Industrial M Projekt. Nicht vollständig implementiert!" },
                    { roleIsAtLeast: Role.ADMIN, change: "Industrial M: Rückportierung der System- und BMW-Komponente" },
                ],
            },
            {
                version: "2024.11.2",
                changes: [
                    Changelog.UI + "Verbesserungen am Inbetriebnahmeassistent, historische Darstellungen",
                    Changelog.product(Product.HOME_6_10_15) + "Produktkompatibilität",
                    Changelog.app(App.TIME_OF_USE) + "Dynamische Reduzierung der Beladeleistung bei aktiver Dimmung nach §14a EnWG",
                    Changelog.library(Library.GRADLE),
                    { roleIsAtLeast: Role.INSTALLER, change: Changelog.product(Product.HOME_10, Product.HOME_20_30, Product.HOME_6_10_15) + "Konfigurationseinstellung: NA-Schutz aktiviert?" },
                    { roleIsAtLeast: Role.ADMIN, change: "Einstellungen | Home Service Assistent: Detailanalyse Module und Tower" },
                    { roleIsAtLeast: Role.ADMIN, change: "Apps mit IP-Adresse: verbiete Konfiguration der FEMS-IP-Adresse" }],
            },
            {
                version: "2024.11.1",
                changes: [
                    Changelog.openems("2024.11.0"),
                    Changelog.UI,
                    Changelog.product(Product.HOME_10, Product.HOME_20_30) + "Allgemeine Optimierungen",
                    Changelog.app(App.TIME_OF_USE, App.ENTSO_E) + "Fehlerbehebung beim Abrufen der Preise von der XML-Schnittstelle; Währungsumrechnung durch API der Europäischen Zentralbank",
                    Changelog.app(App.TIME_OF_USE, App.RABOT_ENERGY) + "Fehlerbehebung bei der OAuth Authentifizierung",
                    Changelog.app(App.TIME_OF_USE, App.SWISSPOWER) + "Kompatibilität mit dynamischen Stromtarifen der Swisspower-Alianz (Schweiz)",
                    { roleIsAtLeast: Role.INSTALLER, change: "Inbetriebnahmeassistent: Konfiguration der Dimmung nach §14a EnWG" },
                    { roleIsAtLeast: Role.INSTALLER, change: Changelog.product(Product.HOME_10, Product.HOME_20_30) + "Korrektur des Vorzeichens bei phasengenauen Stromwerten" },
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.app(App.TIME_OF_USE) + "Alpha-Test für V2_ENERGY_SCHEDULABLE" },
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.product(Product.HOME_10, Product.HOME_20_30) + "Fehlerbehebung Geräteerkennung, erste Kompatibilität mit Gen2" },
                    { roleIsAtLeast: Role.ADMIN, change: "Backend Performance-Optimierung: Jitter beim Senden aggregierter Daten" },
                    { roleIsAtLeast: Role.ADMIN, change: "Host: neuer Channel _host/OsVersion zur Identifikation der Linux-Version" },
                ],
            },
            {
                version: "2024.10.3",
                changes: [
                    Changelog.UI + "Optimierung der historischen Ansicht, Anlagenprofil Kategorie 'E-Auto-Ladestation', Inbetriebnahmeassistent",
                    Changelog.app(App.TIME_OF_USE) + "Fehlerbehebung bei der Ermittlung des Verbrauchs einer Ladesäule",
                    { roleIsAtLeast: Role.ADMIN, change: "Home: Anpassung der Battery-Protection für 64 Ah" },
                ],
            },
            {
                version: "2024.10.2",
                changes: [
                    Changelog.openems("2024.10.0"),
                    Changelog.UI,
                    Changelog.app(App.TIME_OF_USE) + "Ende des Beta-Tests. Öffentliche Freigabe der Funktion \"Beladung aus dem Netz\"",
                    Changelog.app(App.EVCS_AC, App.KEBA, App.HARDY_BARTH) + "Phasengenaue Darstellung des Live-Verbrauchs, in der App konfigurierbare Phasenrotation, umfangreiche interne Verbesserungen",
                    Changelog.app(App.POWER_TO_HEAT, App.HEIZSTAB) + "Optimierung der historischen Ansicht",
                    Changelog.product(Product.INDUSTRIAL_L) + "Produktkompatibilität, Verbesserungen an der State-Machine, am Fehlerhandling und Einbindung der Brandmeldeanlage",
                    "Erweiterung des Excel-Exports aus der historischen Ansicht",
                    { roleIsAtLeast: Role.ADMIN, change: "Home: Verbesserung des GoodWe-Update-Tools, DSP und ARM Beta-Version im Home-Assistant" },
                    { roleIsAtLeast: Role.ADMIN, change: "_sum: Ablage der maximal jemals gemessenen Werte in Odoo" },
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.UI + "Energy Journey: Batterieerweiterung bei mehreren Türmen" },
                    Changelog.library(Library.GRADLE),
                ],
            },
            {
                version: "2024.10.1",
                changes: [
                    Changelog.UI + "Allgemeine Verbesserungen, Fehlerbehebung im Bereich Historie",
                    Changelog.product(Product.COMMERCIAL_92) + "Produktkompatibilität und Inbetriebnahmeassistent",
                    Changelog.app(App.NETZDIENLICHE_BELADUNG_HC) + "Warnung bei fehlender App zur Erfassung der PV-Erzeugung",
                    Changelog.app(App.EVCS_AC, App.KEBA) + "Keine Fehlermeldung mehr, wenn für §14a EnWG-Kompatibilität an der Ladesäule Dip-Switch 2.6 gesetzt wurde",
                    Changelog.app(App.EVCS_AC, App.HARDY_BARTH) + "Warnung bei fehlenden Zählerwerten",
                    Changelog.app(App.EVCS_AC, App.KEBA, App.HARDY_BARTH) + "Visualisierung der Umschaltzeit im Automatikmodus",
                    Changelog.app(App.MODBUS_TCP_API) + "Verbesserung der Visualisierung von Schreibzugriffen in Live und Historie",
                    "Verbindungsprobleme zum Online-Monitoring: produktspezifische Anleitungen zur Fehleranalyse",
                    { roleIsAtLeast: Role.INSTALLER, change: "Online-Monitoring Historie: Verbesserung der Darstellung von Strom und Spannung" },
                    { roleIsAtLeast: Role.INSTALLER, change: "KACO 50 und 92 Batteriewechselrichter: umfangreiche Verbesserungen an der State-Machine und am Fehlerhandling" },
                    { roleIsAtLeast: Role.ADMIN, change: "(!) Alle Modbus-Geräte: Herabstufung von \"Modbus Communication failed\" zu WARNING. Notwendig für neue State-Machine und Fehlerhandling" },
                    { roleIsAtLeast: Role.ADMIN, change: "(!) Alle Batterien und Batteriewechselrichter: Herabstufung fast aller FAULTs zu WARNINGs. Notwendig für neue State-Machine und Fehlerhandling" },
                    { roleIsAtLeast: Role.ADMIN, change: "Modbus-Bridge: Fehlerbehebung. In einem seltenen Fall konnte es passieren, dass die Modbus-Kommunikation nicht startet" },
                    { roleIsAtLeast: Role.ADMIN, change: "Online-Monitoring: Verbesserungen im Energy-Journey-Modul" },
                    { roleIsAtLeast: Role.ADMIN, change: "Online-Monitoring Übersichtsfilter: Auswahl von Produkt-Typ \"Commercial 92\"" },
                    { roleIsAtLeast: Role.ADMIN, change: "Online-Monitoring: DEBUG-Mode kann nur noch durch ADMIN aktiviert werden" },
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.app(App.TIME_OF_USE) + "Preis \"0 Cent/kWh\" wird jetzt richtig dargestellt; war vorher \"- Cent/kWh\"" },
                    { roleIsAtLeast: Role.ADMIN, change: "Industrial S/L: Weitere Standardisierung" },
                    { roleIsAtLeast: Role.ADMIN, change: "Neuer Channel \"_meta/SystemTimeUtc\": seconds since 1st January 1970 00:00:00 UTC" },
                ],
            },
            {
                version: "2024.9.1",
                changes: [
                    Changelog.openems("2024.9.0"),
                    Changelog.UI + "Allgemeine Verbesserungen, Fehlerbehebung und Performance-Optimierungen",
                    Changelog.app(App.MODBUS_TCP_API) + "Visualisierung der Schreibzugriffe in Live und Historie",
                    "Optimierungen an der lokalen Zeitreihendatenbank ('RRD4j')",
                    Changelog.app(App.NETZDIENLICHE_BELADUNG_HC) + "Korrektur einer fehlerhaften Statusmeldung bei ausgeschalteter netzdienlicher Beladung",
                    "Verbesserungen an der System-Update-Funktion",
                    { roleIsAtLeast: Role.ADMIN, change: "AppCenter-App für PQ-Plus Zähler UMD96 und UMD97" },
                    { roleIsAtLeast: Role.ADMIN, change: "AppCenter-App für Phoenix Contact Zähler EEM-MB370-24DC" },
                    { roleIsAtLeast: Role.ADMIN, change: "AppCenter-App für ESS Limiter §14a (wird automatisch durch Home-App installiert, wenn nötig)" },
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.UI + "Einstellungen | Energy Journey: Freischaltung der Analyse für Batterieerweiterung für Kunden von Home 10 mit IBN vor mehr als einem Jahr" },
                    { roleIsAtLeast: Role.ADMIN, change: "Einstellungen | Channels: Verbesserung beim Wechsel auf anderes FEMS" },
                    { roleIsAtLeast: Role.ADMIN, change: "Einstellungen | Industrial L-Assistent: Serviceassistent für Industrial L" },
                    { roleIsAtLeast: Role.ADMIN, change: "Grundsätzliche Unterstützung für I2C Bus" },
                    { roleIsAtLeast: Role.ADMIN, change: "Status-Channel-Beschreibungen können jetzt übersetzt werden. Start: Meldungen aus dem AppCenter" },
                    { roleIsAtLeast: Role.ADMIN, change: "Neue Komponente: Simulated Predictor" },
                    Changelog.library(Library.ANGULAR, Library.IONIC, Library.APACHE_FELIX_HTTP_JETTY, Library.FASTEXCEL, Library.GUAVA, Library.INFLUXDB),
                ],
            },
            {
                version: "2024.8.1",
                changes: [
                    Changelog.UI + "Einführung der Gesamtphasenanzeige für Verbrauch und Erzeugung in der Historie, Anzeige der letzten Online-Zeit wenn Gerät offline ist",
                    Changelog.product(Product.HOME_10, Product.HOME_20_30) + "Optimierungen bei leerer/voller Batterie",
                    { roleIsAtLeast: Role.INSTALLER, change: Changelog.UI + "Historie: Anzeige der einzelnen Phasen für Strom und Spannung" },
                ],
            },
            {
                version: "2024.7.3",
                changes: [
                    Changelog.UI,
                    Changelog.product(Product.HOME_10, Product.HOME_20_30) + "Optimierungen bei leerer/voller Batterie, Bereinigen von Statusmeldungen",
                    "Verbesserungen an der System-Update-Funktion",
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.product(Product.HOME_10, Product.HOME_20_30) + "UI Widget für 'Dimmung' nach §14a EnWG" },
                ],
            },
            {
                version: "2024.7.2",
                changes: [
                    Changelog.UI + "Korrektur bei der Berechnung des sonstigen Verbrauchs, Differenzierung der Login-Seite für das jeweilige Betriebssystem (Android, iOS, Windows)",
                    "Verbesserungen an der Funktion zum System-Update über das Online-Monitoring: verbesserte Fehlerbehandlung",
                    Changelog.product(Product.COMMERCIAL_50) + "KACO Batteriewechselrichter: Verbesserung der Fehlerbehandlung",
                    { roleIsAtLeast: Role.INSTALLER, change: Changelog.product(Product.HOME_10, Product.HOME_20_30) + "Fehlerbehebung bei der Bestimmung der Anzahl der Batterietürme" },
                    { roleIsAtLeast: Role.ADMIN, change: "Online-Monitoring: neues Werbewidget, Fehlerbehebung 'Globale Rolle' unter Einstellungen" },
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.product(Product.HOME_10, Product.HOME_20_30) + "Controller zur Umsetzung der 'Dimmung' nach §14a EnWG" },
                ],
            },
            {
                version: "2024.7.1",
                changes: [
                    Changelog.openems("2024.7.0"),
                    Changelog.UI + "Weiterleitung zum Login bei abgelaufenem Session-Token, Aktualisierung der QR-Codes für Android und iOS, verbesserte Darstellung und Fehlerbehandlung bei History-Charts, Fehlerbehebung bei lokalem Login, phasengenaue historische Darstellung des Verbrauchs",
                    "Anpassungen an der Konfiguration des Netzwerk-Zeitservers (ntp.fenecon.de)",
                    Changelog.product(Product.INDUSTRIAL_S, Product.INDUSTRIAL_L) + "Neues System-Widget zum Start/Stop der Anlage",
                    { roleIsAtLeast: Role.INSTALLER, change: Changelog.UI + "Darstellung von Strom und Spannung in History-Charts für Erzeuger und Verbraucher" },
                    { roleIsAtLeast: Role.INSTALLER, change: Changelog.product(Product.HOME_10, Product.HOME_20_30) + "Fehlerbehebung bei der Bestimmung der Anzahl der Batterietürme" },
                    { roleIsAtLeast: Role.ADMIN, change: "Online-Monitoring: Anpassung der URL auf https://portal.fenecon.de (ohne '/m/')" },
                    { roleIsAtLeast: Role.ADMIN, change: "Home-Assistent: Anzeige der Charger auch für Home 20 & 30" },
                    { roleIsAtLeast: Role.ADMIN, change: "MR Gridcon wird nicht mehr unterstützt durch FEMS" },
                    { roleIsAtLeast: Role.ADMIN, change: "Einstellungen: separierte Darstellung von Widgets, die nur für Service & Administration sichtbar sind" },
                    { roleIsAtLeast: Role.ADMIN, change: "Einstellungen | Power-Assistant: detaillierte Analyse aktueller Leistungsvorgaben und -limitierungen" },
                    { roleIsAtLeast: Role.ADMIN, change: "Einstellungen | Channels: allgemeine Verbesserungen (OpenEMS), Fehlerbehebung beim Setzen von Werten" },
                    { roleIsAtLeast: Role.ADMIN, change: "MQTT-Controller: Verbesserung reconnect bei Verbindungsabbruch (OpenEMS)" },
                    { roleIsAtLeast: Role.ADMIN, change: "Edge2Edge Meter (OpenEMS)" },
                    { roleIsAtLeast: Role.ADMIN, change: "Shelly: mehr Kompatibilitäten (OpenEMS)" },
                    { roleIsAtLeast: Role.ADMIN, change: "SunSpec: Channels haben standardmäßig PersistencePriority VERY_LOW und werden nur optional ans Backend gesendet" },
                    { roleIsAtLeast: Role.ADMIN, change: "App Center: interne Apps für Discovergy-Zähler und lokale InfluxDB" },
                    Changelog.library(Library.APACHE_FELIX_SCR, Library.APACHE_FELIX_HTTP_JETTY, Library.NGX_FORMLY, Library.CHART_JS, Library.UUID),
                ],
            },
            {
                version: "2024.6.1",
                changes: [
                    Changelog.openems("2024.6.0"),
                    Changelog.UI + "Allgemein Verbesserungen, neuer Login-Screen mit Links zu Apps für Android und iOS, phasengenaue historische Darstellung der Erzeugung",
                    Changelog.app(App.MODBUS_TCP_API) + "Neue Modbus-Register für Speichersysteme: MinCellVoltage, MaxCellVoltage, MinCellTemperature und MaxCellTemperature",
                    "Optimierung der Stabilität und Leistung des Backends",
                    Changelog.app(App.EVCS_AC, App.HARDY_BARTH) + "Allgemeine Verbesserungen",
                    Changelog.library(Library.GUAVA, Library.GRADLE, Library.INFLUXDB, Library.GSON, Library.APACHE_FELIX_HTTP_JETTY),
                    { roleIsAtLeast: Role.ADMIN, change: "System-Update über Online-Monitoring: Update von Industrial-Release/SNAPSHOT auch durch Kunde/Installateur" },
                    { roleIsAtLeast: Role.ADMIN, change: "Remote-Service: Service beendet sich automatisch 48 Stunden nach Systemstart bzw. manueller Aktivierung" },
                    { roleIsAtLeast: Role.ADMIN, change: "Weidmüller Modbus/TCP Feldbuskoppler: Behebung eines kritischen Fehlers" },
                    { roleIsAtLeast: Role.ADMIN, change: "Debian-Paket/Update: Verbesserungen für \"Disk is full\"-Fehler" },
                ],
            },
            {
                version: "2024.5.1",
                changes: [
                    Changelog.openems("2024.5.0"),
                    Changelog.UI,
                    Changelog.product(Product.HOME_20_30) + "Verbesserungen am Inbetriebnahmeassistent",
                    Changelog.product(Product.HOME_10, Product.HOME_20_30, Product.INDUSTRIAL_S) + "Optimierungen bei leerer/voller Batterie",
                    Changelog.UI + "Verbesserung am System-Log",
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.product(Product.HOME_10, Product.HOME_20_30) + "Abschalten der Batterie bei niedriger Zellspannung und keiner Beladung. Sicheres Schreiben von ChargeMaxVoltage/DischargeMinVoltage, Korrigierte Zuordnung von DIAG_STATUS Meldungen, Ignoriere gelegentliche unmögliche Werte für ActivePower" },
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.product(Product.HOME_20_30) + "Hinweis auf Umstellung der MPPT Informationen im Online-Monitoring" },
                    { roleIsAtLeast: Role.ADMIN, change: "Leistungsverteilung: Verbesserung der KEEPING_ALL_EQUALS-Strategie bei Speicher-Clustern" },
                    { roleIsAtLeast: Role.ADMIN, change: "Modbus/SunSpec: Anzeige von Status-Informationen (\"Bit-Words\")" },
                    { roleIsAtLeast: Role.ADMIN, change: "Netzwerkkonfiguration über Online-Monitoring: Fehlerbehebung bei [Gateway] und [Route]" },
                    { roleIsAtLeast: Role.ADMIN, change: "System-Update über Online-Monitoring: Warnhinweis vor Ausführung" },
                ],
            },
            {
                version: "2024.4.1",
                changes: [
                    Changelog.openems("2024.4.0"),
                    Changelog.UI + "Fehlerbehebung Darstellung im lokalen Monitoring (Zugriff über IP-Adresse im Heimnetzwerk), Verbesserungen an der \"Footer\"-Leiste, Optimierung der historischen Ansicht für mobile Endgeräte",
                    Changelog.app(App.PV_INVERTER, App.SMA) + "Fehlerbehebung bei Modellen mit neuerem SunSpec-Protokoll (SMA Sunny Tripower mit SunSpec Model 7xx)",
                    Changelog.app(App.TIME_OF_USE) + Changelog.GENERAL_OPTIMIZATION,
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.product(Product.HOME_20_30) + "Vorbereitung zur Änderung der PV-Anzeige von einzelnen Strings auf gesammte MPPT Informationen, da aus technischen Gründen keine zuverlässigen Werte je String berechnet werden können. Umstellung erfordert jeweils manuelle Anpassung der historischen Daten durch FEMS-Team." },
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.product(Product.COMMERCIAL_50) + "Anpassung an State-Machine für KACO Batteriewechselrichter. Ersetzt MAX_START_ATTEMPTS durch MAX_START_TIMEOUT. Neuer Fehlerstatus GRID_DISCONNECTION" },
                    { roleIsAtLeast: Role.ADMIN, change: "Online-Monitoring-Demo: Verbesserung und automatische Anonymisierung. http://portal.fenecon.de/demo" },
                ],
            },
            {
                version: "2024.3.1",
                changes: [
                    Changelog.openems("2024.3.0"),
                    Changelog.UI + "Optimierung der historischen Ansicht für mobile Endgeräte",
                    Changelog.UI + "Anzeige der EMS-Nr. im Seitentitel, \"Footer\"-Leiste zur Anzeige der EMS-Nr. und -Version",
                    Changelog.product(Product.HOME_10, Product.HOME_20_30) + "Verbesserungen am Inbetriebnahmeassistent",
                    Changelog.app(App.TIME_OF_USE) + "Verbesserung der Ansicht für Live und Historie und an der KI-Performance, verbessertes Verhalten im Frühling, Kompatibilität mit §14a EnWG",
                    Changelog.app(App.TIME_OF_USE, App.TIBBER) + "Verbessertes Behandlung von Fehlern",
                    "Neue Funktion \"EMS neu starten\" in Einstellungen | System (ab Version 2024.2.2)",
                    Changelog.app(App.PV_INVERTER, App.KACO) + "Konfigurationsmöglichkeit für Modbus-Unit-ID",
                    Changelog.app(App.POWER_TO_HEAT, App.HEIZSTAB) + "Optimierung der historischen Ansicht",
                    { roleIsAtLeast: Role.ADMIN, change: "Verbesserungen am \"Home Service Assistent\"" },
                    // { roleIsAtLeast: Role.ADMIN, change: "Automatische Benachrichtigung bei Systemfehler (erster interner Feldtest)" },
                    { roleIsAtLeast: Role.ADMIN, change: "IBN-Assistent für Heckert: Weiterleitung zum App Center für Installation der kostenlosen App" },
                    { roleIsAtLeast: Role.ADMIN, change: "Neue App für Service: Ladezustand festlegen (wie Batterieerweiterung, aber ohne Anzeige im UI des Kunden)" },
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.app(App.TIME_OF_USE, App.TIBBER) + "Darstellung von \"xxx\" bei gesetztem Token, Verbesserung der 'Homes'-Option" },
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.app(App.TIME_OF_USE) + "Nutzer können jetzt eigenständig die App wechseln (deinstallieren und neu installieren) - z. B. von Tibber zu Awattar" },
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.product(Product.HOME_10) + "Fehlerbehebung bei der Erkennung der Anzahl der Türme, automatische Deaktivierung des Schattenmanagements" },
                    { roleIsAtLeast: Role.ADMIN, change: "Einstellungen | Channels: Hinweis, wenn Werte nicht sekündlich aktualisiert werden" },
                    { roleIsAtLeast: Role.ADMIN, change: "ESS Cycle-Controller: Fehlerbehebungen" },
                    { roleIsAtLeast: Role.ADMIN, change: "App Center: Hinweis wenn noch uneingelöste Keys vorhanden sind" },
                ],
            },
            {
                version: "2024.2.3",
                changes: [
                    Changelog.UI,
                    Changelog.product(Product.HOME_10, Product.HOME_20_30) + "Entladeverhalten bei voller Batterie",
                    Changelog.product(Product.HOME_10, Product.HOME_20_30) + "Verbesserungen am Inbetriebnahmeassistent",
                    Changelog.app(App.TIME_OF_USE) + "(BETA-Test Beladung aus dem Netz): Verbesserungen am Algorithmus",
                ],
            },
            {
                version: "2024.2.2",
                changes: [
                    Changelog.app(App.TIME_OF_USE) + "Offizielle Freigabe für " + Changelog.product(Product.HOME_20_30),
                    Changelog.product(Product.HOME_10, Product.HOME_20_30) + "Verbesserungen am Inbetriebnahmeassistent",
                    Changelog.app(App.TIME_OF_USE) + "Neue " + Changelog.link("App-Dokumentation", "https://docs.fenecon.de/de/_/latest/fems/fems-app/OEM_App_TOU.html") + ", Darstellung geplanter Fahrplan in Live-Widget, adaptive Berechnung der Beladeleistung aus dem Netz (BETA-Test), verbessertes Verhalten i.V.m. PV-Erzeugung",
                    { roleIsAtLeast: Role.ADMIN, change: "FEMS App EZA-Regler über App Center installierbar" },
                    { roleIsAtLeast: Role.ADMIN, change: "System-Neustart: Vorbereitung für Neustart-Button (benötigt zukünftig mindestens diese Version; UI noch in Entwicklung)" },
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.app(App.TIME_OF_USE) + " kann nur noch mit Home 10, 20 & 30 installiert werden" },
                    { roleIsAtLeast: Role.ADMIN, change: "Neues Werbe-Widget für Home 10, 20 & 30 Systeme" },
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.product(Product.HOME_20_30) + ": Vorbereitungen für externe RS485-Schnittstelle und 3-Phasensensor ohne Stromwandler" },
                    { roleIsAtLeast: Role.ADMIN, change: "Inbetriebnahmeassistent: kostenlose AC-Erzeuger entfernt; stattdessen Weiterleitung auf App Center nach Abschluss der IBN" },
                ],
            },
            {
                version: "2024.2.1",
                changes: [
                    Changelog.openems("2024.2.0"),
                    Changelog.UI,
                    Changelog.app(App.TIME_OF_USE) + "Optimierung der KI-Performance, Berücksichtigung aller verfügbaren Day-Ahead-Preise, adaptive Beladeleistung abhängig von der Batteriekapazität, uvm.",
                    Changelog.app(App.TIME_OF_USE, App.AWATTAR) + "Preise für Österreich",
                    { roleIsAtLeast: Role.ADMIN, change: "KACO Battery-Inverter 50/92: Verbesserung der Regelgeschwindigkeit" },
                    { roleIsAtLeast: Role.ADMIN, change: "Home 20 & 30: Vorbereitungen für zusätzlichen RS485-Port" },
                    { roleIsAtLeast: Role.ADMIN, change: "Online-Monitoring Live-Energiemonitor: Persistierung maximaler Netzbezug/-einspeisung, Erzeugung, Verbrauch" },
                    { roleIsAtLeast: Role.ADMIN, change: "OpenEMS B-Control EM 300 Zähler: allgemeine Verbesserungen" },
                    { roleIsAtLeast: Role.ADMIN, change: "OpenEMS MQTT-Controller: Unterstützung für TLS-Verschlüsselung" },
                    { roleIsAtLeast: Role.ADMIN, change: "OpenEMS Camille Bauer APLUS Zähler: Test für FFR" },
                    Changelog.library(Library.FASTEXCEL, Library.APACHE_FELIX_HTTP_JETTY, Library.APACHE_FELIX_SCR),
                ],
            },
            {
                version: "2024.1.1",
                changes: [
                    Changelog.openems("2024.1.0"),
                    Changelog.app(App.TIME_OF_USE) + "(BETA-Test Beladung aus dem Netz): Verbesserungen am Algorithmus (Berücksichtigung Notstromvorhaltung, KI-Performance-Optimierung, kontinuierliche Beladeleistung, uvm.)",
                    Changelog.app(App.HOCHLASTZEITFENSTER) + "Verbesserung der Visualisierung",
                    "Online-Monitoring Live-Energiemonitor: Darstellung der maximalen Netzbezug/-einspeisung, Erzeugung, Verbrauch",
                    Changelog.library(Library.INFLUXDB, Library.POSTGRESQL, Library.APACHE_FELIX_HTTP_JETTY, Library.JNA, Library.OKIO, Library.GUAVA, Library.GRADLE, Library.FASTEXCEL),
                ],
            },
            {
                version: "2023.12.2",
                changes: [
                    Changelog.product(Product.HOME_10, Product.HOME_20_30) + "Fehlerbehebungen zu Version 2023.12.1",
                ],
            },
            {
                version: "2023.12.1",
                changes: [
                    Changelog.openems("2023.12.0"),
                    Changelog.product(Product.HOME_10, Product.HOME_20_30) + Changelog.GENERAL_OPTIMIZATION,
                    "Verbesserungen am Inbetriebnahmeassistent (breitere Darstellung, Prüfen der Konfiguration, Home 20 & 30 mit mehreren Batterietürmen)",
                    Changelog.app(App.TIME_OF_USE) + "(BETA-Test): Verbesserungen am Algorithmus",
                    { roleIsAtLeast: Role.ADMIN, change: "GoodWe Netzzähler: setze Werte auf UNDEFINED, wenn Kommunikationsverbindung gestört ist (Status 'GoodWe has no Grid-Meter')" },
                    { roleIsAtLeast: Role.ADMIN, change: "GoodWe Battery-Inverter: Ausblenden Fehler bei PU_ENABLE_CURVE" },
                    { roleIsAtLeast: Role.ADMIN, change: "Interne Verbesserungen: Fehlerbehebung Modbus-Bridge ConcurrentModificationException, State-Channels werden immer mit 'false' initialisiert, Exception-Handling in ESS-Power, Debug-Log bei fehlendem 'additionalChannel'" },
                    Changelog.library(Library.GRADLE, Library.FASTEXCEL),
                ],
            },
            {
                version: "2023.11.3",
                changes: [
                    Changelog.UI,
                    "Energiewerte in der Historischen Detailansicht für Verbraucher",
                    Changelog.product(Product.HOME_10, Product.HOME_20_30) + "Option zum Deaktivieren der Einspeise-Limitierung im Inbetriebnahmeassistent",
                    Changelog.product(Product.HOME_10, Product.HOME_20_30) + "Konfigurationsparameter für Rundsteuerempfänger",
                    Changelog.app(App.TIME_OF_USE) + "(BETA-Test): Verbesserungen der KI-Performance und am Algorithmus",
                    "App Center: Verbesserte Auswahl von Relaisausgängen",
                    Changelog.library(Library.FASTEXCEL),
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.app(App.PV_INVERTER, App.SMA) + "Kompatibilität mit neuen Modellen des SMA Sunny Tripower (SunSpec Model 7xx)" },
                    { roleIsAtLeast: Role.ADMIN, change: "Erweiterung der vordefinierten Funktionen in System-Execute" },
                    { roleIsAtLeast: Role.ADMIN, change: "Modernisierung der historischen Ansicht für Channelthreshold-Controller" },
                    { roleIsAtLeast: Role.ADMIN, change: "Home 10, 20 & 30/GoodWe Battery-Inverter: bessere Beschreibung der Konfigurationsparameter in \"Komponenten konfigurieren\"" },
                    { roleIsAtLeast: Role.ADMIN, change: "Home 10, 20 & 30: Ausblenden der Batterierweiterungsfunktion im UI wenn sie nicht aktiv ist" },
                ],
            },
            {
                version: "2023.11.2",
                changes: [
                    Changelog.app(App.TIME_OF_USE) + "(BETA-Test): Verbesserungen am Algorithmus",
                    Changelog.app(App.TIME_OF_USE, App.TIBBER) + "Fehlerbehebungen bei Übernahme des Authentifizierungs-Tokens",
                    { roleIsAtLeast: Role.ADMIN, change: "App Center: Verbesserung beim Handling voneinander abhängiger Apps, Integrated System App für Industrial S" },
                    { roleIsAtLeast: Role.ADMIN, change: "Home 10, 20 & 30: Verbesserung der Kompatibilitätsprüfung Wechselrichter+Batterie (State 'ImpossibleFeneconHomeCombination')" },
                ],
            },
            {
                version: "2023.11.1",
                changes: [
                    Changelog.openems("2023.11.0"),
                    Changelog.UI + "Fehlerbehebung historische Ansicht, Anzeige eingeplanter Batterieerweiterung",
                    Changelog.product(Product.HOME_20_30) + "Performance-Verbesserung beim Lesen der Erzeugungsdaten, Verbesserungen am Inbetriebnahmeassistent",
                    Changelog.app(App.PV_INVERTER, App.KACO) + "Fehlerbehebung bei Darstellung der Energiewerte",
                    Changelog.app(App.TIME_OF_USE) + "Start BETA-Test für aktive Beladung aus dem Netz",
                    { roleIsAtLeast: Role.ADMIN, change: "UI: Filter für Home 20 & 30 in der Übersichtsliste" },
                    { roleIsAtLeast: Role.ADMIN, change: "Entferne Unterstützung für TimescaleDB, Tesla Powerwall" },
                    { roleIsAtLeast: Role.ADMIN, change: "Deaktiviere alten FEMS Remote-Service" },
                    { roleIsAtLeast: Role.ADMIN, change: "App Center: Verbesserte Kompatibilitätsprüfung von Apps, Performance-Optimierung durch Laden der Bilder von FENECON Docs" },
                    { roleIsAtLeast: Role.ADMIN, change: "ESS-Cluster: einheitliche Berechnung des Gesamt-SoC unter Berücksichtigung der Kapazität" },
                    { roleIsAtLeast: Role.ADMIN, change: "Notstromreserve: Fehlerbehebung bei gemessener negativer Erzeugung" },
                    { roleIsAtLeast: Role.ADMIN, change: "Home 10, 20 & 30: korrigierter Skalierungsfaktor für Strom und Spannung bei Notstromverbrauchern, zuverlässigere Identifikation des Wechselrichters" },
                    { roleIsAtLeast: Role.ADMIN, change: "Home 20 & 30: Fehlerbehebung beim Lesen der Seriennummern der Batterie, Reduzierung der Beladeleistung bei niedrigen Zellspannungen" },
                    { roleIsAtLeast: Role.ADMIN, change: "Dynamischer Stromtarif: nutze 'UnmanagedConsumption' für Vorhersage des Verbrauchs" },
                    { roleIsAtLeast: Role.ADMIN, change: "Ladestation KEBA/HardyBarth: bessere Meldung bei Kommunikationsfehler" },
                    Changelog.library(Library.APACHE_FELIX_HTTP_JETTY, Library.HIKARI_CP),
                ],
            },
            {
                version: "2023.10.3",
                changes: [
                    "Fehlerbehebung: lokales Monitoring",
                    "Fehlerbehebung: historische Ansicht im Online-Monitoring",
                    Changelog.product(Product.HOME_20_30) + "Fehlerbehebung bei der Inbetriebnahme",
                    "Dynamischer Stromtarif ENTSO-E: Sicherstellen, dass Day-Ahead-Tarife beim Start abgerufen werden",
                    Changelog.library(Library.OKHTTP),
                ],
            },
            {
                version: "2023.10.2",
                changes: [
                    "Fehlerbehebung lokales Monitoring: die Abfrage historischer Daten war seit Version 2023.10.1 nur für den aktuellen Tag möglich",
                ],
            },
            {
                version: "2023.10.1",
                changes: [
                    Changelog.openems("2023.10.0"),
                    Changelog.UI,
                    Changelog.product(Product.HOME_20_30, Product.COMMERCIAL_30, Product.COMMERCIAL_50) + Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistent",
                    Changelog.app(App.EVCS_DC, App.ALPITRONIC) + "Verbesserung der Energieberechnung bei Kommunikationsausfall",
                    Changelog.app(App.PV_INVERTER, App.KACO, App.SMA, App.KOSTAL, App.FRONIUS, App.SOLAREDGE) + "Verbesserung in der Kompatibilität mit Modbus/SunSpec-Protokollen (Handling von häufig wechselnden 'Scale-Factors')",
                    Changelog.app(App.MODBUS_TCP_API) + "Vermeide Lese-Fehler bei 'Write-Only' Registern",
                    "Korrektur der Hilfe-Links zur Dokumentation/Anleitungen",
                    { roleIsAtLeast: Role.ADMIN, change: "UI: Filter in der Übersichtsliste, Routing in der Web-App, Login 'trim' für Benutzername+Passwort" },
                    { roleIsAtLeast: Role.ADMIN, change: "UI Komponente Konfigurieren: Fehlerbehebung bei JSON-Format (z. B. Daily-Scheduler)" },
                    { roleIsAtLeast: Role.ADMIN, change: "UI/Edge: Daten senden für netzdienliche Beladung und Shelly (Plug + 2.5)" },
                    { roleIsAtLeast: Role.ADMIN, change: "Edge: ESS-Cluster Start/Stop, neuer Channel '_sum/UnmanagedConsumptionActivePower', Bugfix bei 1-phasigen und 3-phasig symmetrischen Zählern/PV-Wechselrichtern auf Phase 3" },
                    { roleIsAtLeast: Role.ADMIN, change: "App Center: Verbesserung bei Pflichtfeldern (z. B. IP-Adresse KEBA und andere), Reihenfolge von Auswahllisten, neue FEMS App 'Manuelle Be-/Entladung' (Fix-Active-Power-Controller; nur Admin User)" },
                    { roleIsAtLeast: Role.ADMIN, change: "Release Candidates/SNAPSHOT-Branches: Update auf neuesten RC bzw. SNAPSHOT über System-Update-Funktion im UI" },
                    { roleIsAtLeast: Role.ADMIN, change: "Phoenix Contact Zähler (EEM-MA370-24DC/EEM-MB370-24DC): Implementierung 'invert' Funktion" },
                    { roleIsAtLeast: Role.ADMIN, change: "Neuer Zugang für FEMS Remote-Service: siehe Anleitung in FEMS Teams/Allgemein" },
                    Changelog.library(Library.GRADLE, Library.OKIO, Library.APACHE_FELIX_HTTP_JETTY, Library.BNDTOOLS, Library.GUAVA),
                ],
            },
            {
                version: "2023.9.1",
                changes: [
                    Changelog.openems("2023.9.0"),
                    Changelog.UI,
                    "Performance-Optimierung in der Historischen Ansicht -> Erzeugung",
                    "Umfangreiche Optimierung der Modbus-Kommunikation",
                    Changelog.product(Product.COMMERCIAL_30) + "Verbesserungen am Inbetriebnahmeassistenten für die Netztrennstelle",
                    Changelog.app(App.MODBUS_TCP_API) + "Verbesserungen im App Center",
                    "Daten Nachsenden: verbesserte Erkennung von Übertragungsfehlern",
                    "Verbesserung der Kompatibilität mit SunSpec PV-Wechselrichtern (Unterstützung von 7xx-Blöcken)",
                    Changelog.product(Product.HOME_10, Product.HOME_20_30) + "Verbesserung der Status-/Fehlermeldungen",
                    { roleIsAtLeast: Role.ADMIN, change: "Unterstützung für FENECON Home 20 & 30 (App Center, Prüfbox, F&F Filipowski Analog-Ausgänge, etc.)" },
                    { roleIsAtLeast: Role.ADMIN, change: "Bugfix SDM630 Zähler: Energiewerte" },
                    { roleIsAtLeast: Role.ADMIN, change: "Bugfix FENECON Home: Ansteuerung des Start-Relais für die Batterie" },
                    { roleIsAtLeast: Role.ADMIN, change: "FENECON Home: Implementierung eines spezifischen Service-Dashboards unter Online-Monitoring -> Einstellungen" },
                    { roleIsAtLeast: Role.ADMIN, change: "Online-Monitoring FEMS-Übersicht: BETA-Test Filter nach Produkttyp; Anzeige Systemstatus" },
                    { roleIsAtLeast: Role.ADMIN, change: "Bugfix Online-Monitoring: setze richtige Farbe für Smartphone-Notch" },
                    { roleIsAtLeast: Role.ADMIN, change: "Bugfix System-Log: funktioniert jetzt auch für mehrere FEMSe/Browser-Tabs gleichzeitig" },
                    { roleIsAtLeast: Role.ADMIN, change: "Bugfix im DebugLog für Generic-ESS: Max-Charge-Power" },
                    { roleIsAtLeast: Role.ADMIN, change: "ESS Cycle-Controller: Umfangreiche Verbesserungen" },
                    { roleIsAtLeast: Role.ADMIN, change: "Bugfix Energie-Berechnung für SolarLog" },
                    { roleIsAtLeast: Role.ADMIN, change: "Bugfix KACO50/92: Leistungs-Setpoints" },
                    { roleIsAtLeast: Role.ADMIN, change: "Industrial S/L: enfasbms, F2B" },
                    { roleIsAtLeast: Role.ADMIN, change: "Neue OpenEMS Apps für Webasto Next und Webasto Unite Ladesäulen. Info im OpenEMS Community-Forum folgt" },
                    Changelog.library(Library.OKIO, Library.RRD4J, Library.APACHE_FELIX_HTTP_JETTY, Library.GRADLE, Library.FASTEXCEL),
                ],
            },
            {
                version: "2023.8.2",
                changes: [
                    Changelog.openems("2023.8.0"),
                    Changelog.product(Product.HOME_10, Product.HOME_20_30) + Changelog.GENERAL_OPTIMIZATION,
                    "App Center: Verbesserte Auswahl von Relaisausgängen",
                    Changelog.UI + "Optimierung der historischen Darstellung für mobile Endgeräte",
                    Changelog.app(App.EVCS_AC) + "Technische Überarbeitung des Widgets",
                    Changelog.product(Product.COMMERCIAL_30) + "Fehlerbehebung bei der Ansteuerung der Netztrennstelle",
                    "Daten Nachsenden: verbesserte Erkennung von Übertragungsfehlern",
                    { roleIsAtLeast: Role.ADMIN, change: "Commercial 40 DC (CESS): Fehlerbehebung bei Konfiguration des Chargers" },
                    { roleIsAtLeast: Role.ADMIN, change: "Virtuelle Zähler: Fix für Berechnungsfehler bei Teilausfall" },
                    { roleIsAtLeast: Role.ADMIN, change: "Core.Meta: Globale Konfiguration einer Währung" },
                    { roleIsAtLeast: Role.ADMIN, change: "Industrial L: erste Version einer 'Industrial L Komponente'" },
                    Changelog.library(Library.GUAVA, Library.INFLUXDB),
                ],
            },
            {
                version: "2023.8.1",
                changes: [
                    Changelog.openems("2023.7.0"),
                    Changelog.UI + "Darstellungsfehler auf iOS, Tipp- und Übersetzungsfehler, Entfernen non-funktionale 'Alerting'-Funktion aus lokalem Monitoring",
                    "Daten Nachsenden: nach Übertragungsfehlern (z. B. Ausfall der Internetverbindung oder Wartungsarbeiten am Backend) werden fehlende Daten später nachgesendet",
                    "Lokales Monitoring: Daten im lokalen Monitoring sind nun bis zu 15 Monate lang verfügbar",
                    Changelog.product(Product.HOME_10) + Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistent",
                    Changelog.app(App.EVCS_AC) + "Technische Überarbeitung des Widgets, Speichern-Button",
                    Changelog.app(App.EVCS_AC, App.HARDY_BARTH) + "Verbesserte Verarbeitung der Phasen- und Status-Informationen",
                    "App Center: Allgemeine Verbesserungen",
                    Changelog.product(Product.HOME_10) + Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistent",
                    { roleIsAtLeast: Role.ADMIN, change: "UI: Verbesserungen an 'Channels' in den Einstellungen" },
                    { roleIsAtLeast: Role.ADMIN, change: "UI: Übersicht wird immer angezeigt, wenn der Nutzer Zugriff auf mehr als ein FEMS hat (oder mindestens Installateur ist)" },
                    { roleIsAtLeast: Role.ADMIN, change: "UI: Umfangreiches Refactoring/Code-Bereinigung in der Historie" },
                    { roleIsAtLeast: Role.ADMIN, change: "UI/IBN Home: Link zur englischen Anleitung, Validator für maximale Einspeiseleistung" },
                    { roleIsAtLeast: Role.ADMIN, change: "UI: Verbessertes Sprachhandling für Demo-Zugang" },
                    { roleIsAtLeast: Role.ADMIN, change: "App Center: Auch Service-/Admin-User können Keys einlösen" },
                    { roleIsAtLeast: Role.ADMIN, change: "Edge: Verbesserung des Debug-Logs für Komponenten mit interner State-Machine" },
                    { roleIsAtLeast: Role.ADMIN, change: "Edge: Fehlerbehebung bei der Energieberechnung für einzelne Phasen eines Zählers" },
                    Changelog.library(Library.FASTEXCEL, Library.GUAVA, Library.OKIO, Library.JAVA_WEBSOCKET),
                ],
            },
            {
                version: "2023.6.2",
                changes: [
                    Changelog.UI,
                ],
            },
            {
                version: "2023.6.1",
                changes: [
                    Changelog.openems("2023.6.0"),
                    Changelog.UI,
                    "App Center: Allgemeine Verbesserungen",
                    Changelog.product(Product.HOME_10) + "Anpassung des Regelverhaltens bei Überschusseinspeisung. In Ausnahmefällen wurde im SMART-Mode die Überschussleistung bei voller Batterie falsch berechnet.",
                    Changelog.product(Product.HOME_10) + Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistent",
                    Changelog.UI + "Fehlerbehebung bei der Formatierung von Zahlen in einigen Sprachen",
                    Changelog.app(App.PV_INVERTER, App.KACO, App.SMA, App.KOSTAL, App.FRONIUS, App.SOLAREDGE) + "Dreiphasige Darstellung der Erzeugungsleistung",
                    { roleIsAtLeast: Role.ADMIN, change: "FEMS App Manuelle Relaissteuerung, Blockheizkraftwerk (BHKW), Manuelle Relaissteuerung: Verbesserung der Berechnung der kumulierten Betriebszeit" },
                    { roleIsAtLeast: Role.ADMIN, change: "Energiewerte werden, wenn sie einmal gesetzt waren, nicht mehr auf UNDEFINED gesetzt" },
                    { roleIsAtLeast: Role.ADMIN, change: "KACO Blueplanet Hybrid 10 als PV-Wechselrichter: dreiphasige Darstellung von Spannung, Strom und Leistung" },
                    { roleIsAtLeast: Role.ADMIN, change: "Unterstützung für Phoenix Contact EEM-MA370-24DC und EEM-MB370-24DC Zähler" },
                    Changelog.library(Library.D3, Library.INFLUXDB, Library.FASTEXCEL, Library.GUAVA),
                ],
            },
            {
                version: "2023.5.3",
                changes: [
                    Changelog.app(App.EVCS_AC, App.KEBA) + "Fehlerbehebung",
                ],
            },
            {
                version: "2023.5.2",
                changes: [
                    Changelog.UI,
                    "App Center: Allgemeine Verbesserungen",
                    "IBN-Assistent für Commercial-Serie: Fehlerbehebungen",
                    "Multiladepunktmanagement: Angabe der maximalen Gesamtleistung bei der Installation über das App Center",
                    Changelog.product(Product.COMMERCIAL_30) + " Verbesserung der Notstromumschaltung",
                    Changelog.library(Library.D3, Library.ANGULAR, Library.IONIC, Library.NGX_FORMLY, Library.GUAVA),
                    { roleIsAtLeast: Role.ADMIN, change: "UI: Übersetzungen; mehr Länder bei Benutzerregistrierung; Refactoring der History-Charts für Produktion" },
                    { roleIsAtLeast: Role.ADMIN, change: "IBN-Commercial: Setzen der FEMS-IP-Adresse 192.168.0.9 für Verbindung zur Batterie; Verbesserung bei Validierung von Minimal-Werten; Auslesen der Seriennummern" },
                    { roleIsAtLeast: Role.ADMIN, change: "BETA-Test für 'OpenEMS Apps' (= (noch) nicht offizielle FEMS Apps): EVCS Dezony, Zähler SDM630" },
                ],
            },
            {
                version: "2023.5.1",
                changes: [
                    Changelog.UI,
                    "App Center: Allgemeine Verbesserungen",
                    Changelog.app(App.EVCS_DC, App.ALPITRONIC) + "Release",
                    Changelog.product(Product.HOME_10, Product.COMMERCIAL_30, Product.COMMERCIAL_50) + Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistent",
                    Changelog.app(App.TIME_OF_USE) + "Anzeige der richtigen Währung in Schweden",
                    Changelog.library(Library.OKHTTP, Library.DATE_FNS),
                    { roleIsAtLeast: Role.ADMIN, change: "Solar-Log: Fehlerbehebung bei Energiewerten" },
                ],
            },
            {
                version: "2023.4.3",
                changes: [
                    Changelog.product(Product.PRO_HYBRID_10) + "Fehlerbehebung bei automatischer Suche des Wechselrichters im Netzwerk",
                ],
            },
            {
                version: "2023.4.2",
                changes: [
                    Changelog.app(App.POWER_TO_HEAT, App.BHKW) + "Verbesserungen im App Center",
                    Changelog.app(App.MODBUS_TCP_API) + "Verbesserungen im App Center",
                    Changelog.app(App.REST_JSON_API) + "Verbesserungen im App Center",
                    Changelog.product(Product.COMMERCIAL_30, Product.COMMERCIAL_50) + Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistent",
                    Changelog.app(App.POWER_TO_HEAT, App.WAERMEPUMPE) + "Verbesserung der Fehlerprüfung bei Konfigurationsänderungen",
                    Changelog.app(App.PV_INVERTER) + "Fehlerbehung im nur-lesenden Betrieb (ohne Abregelung)",
                    "Robusteres Fehlerhandling beim Lesen ungültiger Daten von Peripheriegeräten",
                    { roleIsAtLeast: Role.ADMIN, change: "Fix-ActivePower-Controller: erlaubt (nur via 'Komponenten Konfigurieren') auch Min-/Max-Vorgaben für Be-/Entladung und phasengenaue Ansteuerung; ersetzt Asymmetric Fix-ActivePower-Controller" },
                    { roleIsAtLeast: Role.ADMIN, change: "Modbus/TCP-Bridge, KACO blueplanet 10: robusteres Verhalten wenn IP-Adressen mit führenden Leerzeichen konfiguriert werden" },
                    { roleIsAtLeast: Role.ADMIN, change: "EVCS-Controller: funktioniert jetzt auch ohne konfigurierten (Dummy-)Speicher" },
                    Changelog.library(Library.FASTEXCEL),
                ],
            },
            {
                version: "2023.4.1",
                changes: [
                    Changelog.openems("2023.4.0"),
                    Changelog.UI,
                ],
            },
            {
                version: "2023.3.8",
                changes: [
                    "App Center: Fehlerbehebung bei " + Changelog.app(App.EVCS_AC, App.HARDY_BARTH),
                ],
            },
            {
                version: "2023.3.7",
                changes: [
                    Changelog.app(App.TIME_OF_USE) + "Fehlerbehebung in der Live-Ansicht",
                ],
            },
            {
                version: "2023.3.6",
                changes: [
                    "App Center: öffentliches Release",
                    "Link zu " + Changelog.link("FAQ", "https://fenecon.de/faq/#fems") + " korrigiert",
                    Changelog.app(App.TIME_OF_USE) + "Verbesserung der Datenanzeige in der Live-Ansicht",
                    Changelog.app(App.METER, App.KDK) + "Fehlerbehebung beim Lesen der Energiewerte",
                    { roleIsAtLeast: Role.ADMIN, change: "App Center: Anzeige von Modal-Fenstern, Automatische Installation Multiladepunktmanagement, UI-Verbesserungen, erfordere Rolle 'INSTALLER' für FENECON Home, erfordere Rolle 'ADMIN' für MQTT" },
                    { roleIsAtLeast: Role.ADMIN, change: "Werbewidget: FEMS App Center; Link zu Systemupdate bei Versionen < 2023.3.6" },
                    { roleIsAtLeast: Role.ADMIN, change: "Soltaro-Batterien Version C: PreAlarmTotalVoltageHigh, TemperatureDifferenceTooBigPre-Alarm ausgeblendet" },
                    { roleIsAtLeast: Role.ADMIN, change: "OEM Heckert: neues Logo" },
                    { roleIsAtLeast: Role.ADMIN, change: "Fix-State-of-Charge-/Prepare-Battery-Extension-Controller: Fehlerbehebungen" },
                ],
            },
            {
                version: "2023.3.5",
                changes: [
                    "Aktualisierung der Java Runtime Environment auf Version 17 LTS",
                    { roleIsAtLeast: Role.ADMIN, change: "App Center: Verbesserung bei Übersetzungen" },
                ],
            },
            {
                version: "2023.3.4",
                changes: [
                    Changelog.UI,
                    "Verbesserung am Changelog: Anzeige im Bereich \"Systemupdate\" und verbessertes Layout",
                    { roleIsAtLeast: Role.INSTALLER, change: Changelog.product(Product.HOME_10) + "Vorbereitung einer Batterie-Erweiterung (Be-/Entladen auf 30 % SoC) über das Speicher-Widget im Online-Monitoring" },
                    Changelog.app(App.POWER_TO_HEAT, App.WAERMEPUMPE) + "Verbesserung der Fehlerprüfung bei Konfigurationsänderungen",
                    { roleIsAtLeast: Role.ADMIN, change: "Beta-Release Webasto Next Ladestation" },
                    { roleIsAtLeast: Role.ADMIN, change: "App Center: Optimierung Validierung kostenloser Apps, Verbesserung bei Default-Werten, Hardy-Barth mit zwei Ladepunkten" },
                    { roleIsAtLeast: Role.ADMIN, change: "Backend: historische Abfragen auffüllen mit 'null'-Werten, retry by InfluxDB Schreibfehlern, bessere Logs" },
                    Changelog.library(Library.POSTGRESQL, Library.APACHE_FELIX_FILEINSTALL),
                ],
            },
            {
                version: "2023.3.3",
                changes: [
                    Changelog.UI,
                ],
            },
            {
                version: "2023.3.2",
                changes: [
                    "Fehlerbehebung in der historischen Ansicht im lokalen Monitoring",
                    Changelog.app(App.TIME_OF_USE) + "Fehlerbehebung bei der Datenanzeige in der Live-Ansicht",
                    "Umfangreiche Performance-Optimierungen bei historischen Daten",
                    "Fehlerbehebung/Verbesserung bei der Datenübertragung zum Backend",
                    { roleIsAtLeast: Role.ADMIN, change: "Beta-Release Webasto Unite Ladestation" },
                    { roleIsAtLeast: Role.ADMIN, change: "App Center: Umbenennung FEMS Relaisboard 8-Kanal TCP, Berechtigungsproblem bei Validierung von Keys im Backend, Auswahl der Phase bei SMA PV-Wechselrichter, Verbesserung handling kostenloser Apps" },
                    { roleIsAtLeast: Role.ADMIN, change: "UI: neues CI für Heckert" },
                    { roleIsAtLeast: Role.ADMIN, change: "Alpha-Test für PWA Service-Worker" },
                    Changelog.library(Library.FASTEXCEL),
                ],
            },
            {
                version: "2023.3.1",
                changes: [
                    Changelog.openems("2023.3.0"),
                    "Fehlerbehebung/Verbesserung bei der Datenübertragung zum Backend",
                    Changelog.library(Library.FASTEXCEL, Library.APACHE_FELIX_HTTP_JETTY),
                ],
            },
            {
                version: "2023.2.11",
                changes: [
                    "Fehlerbehebung/Verbesserung bei der Datenübertragung zum Backend",
                ],
            },
            {
                version: "2023.2.9",
                changes: [
                    Changelog.UI,
                    "Reduzierung der Datenübertragung zum Backend",
                    { roleIsAtLeast: Role.ADMIN, change: "Fix-State-of-Charge-/Prepare-Battery-Extension-Controller: Änderung des Datum-Formats" },
                    { roleIsAtLeast: Role.ADMIN, change: "UI: Routing-Fehler, Blockieren auf Übersicht-Seite, Browser-Kompatibilität" },
                    { roleIsAtLeast: Role.ADMIN, change: "UI: Feldtest für neuen Time-Of-Use Controller" },
                    { roleIsAtLeast: Role.ADMIN, change: "Backend: Handling von aggregierten Daten, InfluxDB adaptives Lese-/Schreib-Limit, Fehlerbehebung bei Logout" },
                    { roleIsAtLeast: Role.ADMIN, change: "FENECON Home-App: Länder Schweden, Tschechien und Niederlande" },
                ],
            },
            {
                version: "2023.2.6",
                changes: [
                    Changelog.UI + "Fehlerbehebung beim Reconnect der Websocket-Verbindung",
                    Changelog.library(Library.POSTGRESQL, Library.GRADLE),
                    { roleIsAtLeast: Role.ADMIN, change: "App Center: Verbesserungen an Keys" },
                    { roleIsAtLeast: Role.ADMIN, change: "Beta-Release Alpitronic Hypercharger DC" },
                    { roleIsAtLeast: Role.ADMIN, change: "Bugfix Meter.Virtual.Symmetric.Add: Energiewerte" },
                    { roleIsAtLeast: Role.ADMIN, change: "Bugfix SolarEdge Grid-Meter (SunSpec Meter): Energie je Phase" },
                    { roleIsAtLeast: Role.ADMIN, change: "IBN-Assistent/Backend: Verbesserung der Fehlerhandlings" },
                ],
            },
            {
                version: "2023.2.5",
                changes: [
                    Changelog.UI,
                    "Netzwerkkonfiguration: Fehlerbehebung bei Benutzernamen mit Umlauten",
                ],
            },
            {
                version: "2023.2.4",
                changes: [
                    Changelog.UI,
                    { roleIsAtLeast: Role.ADMIN, change: "App Center: Start Demo-Test, Meldung freie Digital-/Relaisausgänge" },
                ],
            },
            {
                version: "2023.2.3",
                changes: [
                    Changelog.UI,
                ],
            },
            {
                version: "2023.2.2",
                changes: [
                    Changelog.UI,
                    Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistent",
                    Changelog.app(App.TIME_OF_USE, App.TIBBER) + "Fehlerbehebungen bei mehreren registrierten Zählern",
                    { roleIsAtLeast: Role.ADMIN, change: "App Center: Verbesserungen an Keys, Navigation, Übersetzungen" },
                    { roleIsAtLeast: Role.ADMIN, change: "Fix-State-of-Charge-/Prepare-Battery-Extension-Controller: Änderung der Datums-Konfiguration, Automatische Installation auf Home-Systemen" },
                    Changelog.library(Library.POSTGRESQL, Library.FASTEXCEL),
                ],
            },
            {
                version: "2023.2.1",
                changes: [
                    Changelog.openems("2023.2.0"),
                    Changelog.product(Product.COMMERCIAL_30) + Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistent",
                    Changelog.app(App.REST_JSON_API) + Changelog.GENERAL_OPTIMIZATION,
                    Changelog.library(Library.ANGULAR, Library.NGX_FORMLY, Library.IONIC, Library.D3),
                ],
            },
            {
                version: "2023.1.3",
                changes: [
                    Changelog.GENERAL_OPTIMIZATION + " an der Übersicht 'Alle Systeme'",
                    "Fehlerbehebung am Online-Monitoring: Anzeige der Live-Daten nach Aktualisierung der Seite im Browser",
                ],
            },
            {
                version: "2023.1.2",
                changes: [
                    Changelog.GENERAL_OPTIMIZATION,
                    { roleIsAtLeast: Role.ADMIN, change: "App Center: Aktiviere App-Keys" },
                    { roleIsAtLeast: Role.ADMIN, change: "Beta-Release Fix-State-of-Charge-/Prepare-Battery-Extension-Controller" },
                ],
            },
            {
                version: "2023.1.1",
                changes: [
                    Changelog.openems("2023.1.0"),
                    Changelog.product(Product.HOME_10) + "Verbesserungen Inbetriebnahmeassistent für KDK-Zähler (Modbus/RTU Parität)",
                    Changelog.product(Product.HOME_10) + "Verbesserung SMART-Mode bei Vorgabe einer maximalen Be-/Entladeleistung",
                    Changelog.app(App.TIME_OF_USE) + "Historie-Chart: Skalierung der Preis-Achse",
                    Changelog.library(Library.NGX_FORMLY, Library.IONIC, Library.JNA, Library.D3),
                    { roleIsAtLeast: Role.ADMIN, change: "App Center: Verbesserung der Geschwindigkeit, automatische Installation von Abhängigkeiten, UI-Verbesserungen, Schreibzugriff-Apps, Übersetzungen/Begriffe" },
                ],
            },
            {
                version: "2022.12.7",
                changes: [
                    "Inbetriebnahmeassistent: Fehlerbehebung",
                ],
            },
            {
                version: "2022.12.6",
                changes: [
                    Changelog.UI,
                ],
            },
            {
                version: "2022.12.5",
                changes: [
                    Changelog.product(Product.PRO_HYBRID_GW, Product.PRO_HYBRID_AC_GW) + "Fehlerbehebung bei Kompatibilität mit älterer Firmware des GoodWe Wechselrichters",
                    { roleIsAtLeast: Role.ADMIN, change: "Besseres Logging von UI-Fehlern im Backend, z. B. für IBN" },
                ],
            },
            {
                version: "2022.12.4",
                changes: [
                    Changelog.UI,
                    "Inbetriebnahmeassistent: Fehlerbehebung",
                    Changelog.library(Library.ANGULAR, Library.IONIC, Library.NGX_FORMLY, Library.NGX_COOKIE_SERVICE, Library.D3, Library.FASTEXCEL, Library.OSGI_UTIL_PROMISE),
                ],
            },
            {
                version: "2022.12.3",
                changes: [
                    Changelog.UI,
                    "Inbetriebnahmeassistent: Fehlerbehebung",
                ],
            },
            {
                version: "2022.12.2",
                changes: [
                    Changelog.app(App.METER, App.KDK) + "Implementierung KDK 420506PRO20-U (2PU CT)",
                ],
            },
            {
                version: "2022.12.1",
                changes: [
                    Changelog.openems("2022.12.0"),
                    Changelog.UI + "Verbesserung Login/Session-Management",
                    "Verbesserungen Inbetriebnahmeassistent Commercial: englische Übersetzung und Unterstützung KDK-Zähler",
                    Changelog.app(App.EVCS_AC, App.KEBA) + "Anzeige Ladeleistung und Status am Display",
                    { roleIsAtLeast: Role.ADMIN, change: "App Center: Vorbereitungen für Key-Modell" },
                    { roleIsAtLeast: Role.ADMIN, change: "UI: Verhindere mehrfaches Klicken des Login-Button; unterscheide Authentifizierungs-Fehler vs. Odoo-Timeout" },
                    { roleIsAtLeast: Role.ADMIN, change: "ESS-Cluster: Unterstützung für Start-Stop von mehreren ESS" },
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.product(Product.HOME_10) + "Korrektur bei Frequenzmessung des Netzzählers" },
                    { roleIsAtLeast: Role.ADMIN, change: "Backend Alerting: Verhinderung von negativen Seiteneffekten beim Abarbeiten von Meldungen" },
                    { roleIsAtLeast: Role.ADMIN, change: "Aktualisierung/Bereinigung der Werbewidgets" },
                ],
            },
            {
                version: "2022.11.7",
                changes: [
                    Changelog.UI,
                    { roleIsAtLeast: Role.ADMIN, change: "Performance-Optimierungen am Backend" },
                ],
            },
            {
                version: "2022.11.6",
                changes: [
                    Changelog.UI,
                    { roleIsAtLeast: Role.ADMIN, change: "Commercial Gen1-Batterie: Anpassung der Parameter für die Batterie-Protection" },
                ],
            },
            {
                version: "2022.11.5",
                changes: [
                    Changelog.UI,
                ],
            },
            {
                version: "2022.11.4",
                changes: [
                    Changelog.app(App.MODBUS_TCP_API) + Changelog.GENERAL_OPTIMIZATION,
                    { roleIsAtLeast: Role.INSTALLER, change: "Anzeige von Strom und Spannung des Netzzählers" },
                    { roleIsAtLeast: Role.INSTALLER, change: Changelog.product(Product.HOME_10) + "Korrektur bei Strom-/Spannungswerten des Netzzählers" },
                    { roleIsAtLeast: Role.ADMIN, change: "Kleine Korrekturen im App Center" },
                ],
            },
            {
                version: "2022.11.3",
                changes: [
                    "Fehlerbehebungen der Übersetzung",
                    Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistenten",
                ],
            },
            {
                version: "2022.11.2",
                changes: [
                    Changelog.app(App.POWER_TO_HEAT, App.WAERMEPUMPE) + "Verbesserung der Logik + Übersetzung",
                    Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistenten",
                    Changelog.UI + "Links zur Dokumentation/Hilfe für Apps aktualisiert",
                    Changelog.UI + "Verbesserungen in der historischen Ansicht",
                    "Verbesserungen bei automatischen E-Mail-Benachrichtungen",
                    "Darstellung des Zeitpunkts der letzten Datenübertragung in der Übersicht",
                    { roleIsAtLeast: Role.ADMIN, change: "Kleine Korrekturen im App Center" },
                    { roleIsAtLeast: Role.ADMIN, change: "Unterstützung für KDK 2PU CT Zähler" },
                ],
            },
            {
                version: "2022.11.1",
                changes: [
                    Changelog.openems("2022.11.0"),
                    "Fehlerbehebung bei der automatischem Reconnect mit dem Online-Monitoring nach Verbindungsausfall",
                    Changelog.library(Library.APACHE_FELIX_HTTP_JETTY, Library.DATE_FNS, Library.MOSHI, Library.ANGULAR, Library.IONIC, Library.NGX_FORMLY),
                    { roleIsAtLeast: Role.ADMIN, change: "KACO Blueplanet Hybrid 10: interne Architektur geändert" },
                    { roleIsAtLeast: Role.ADMIN, change: "Simulator Grid-Meter: Fehlerbehebung in Verbindung mit Ess-Cluster" },
                ],
            },
            {
                version: "2022.10.7",
                changes: [
                    Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistenten",
                    "Fehlerbehebungen der Übersetzung Deutsch und Englisch",
                    Changelog.app(App.EVCS_AC) + Changelog.GENERAL_OPTIMIZATION,
                    { roleIsAtLeast: Role.ADMIN, change: "Modbus/TCP-Api-Kompatibilität für GoodWe Zähler" },
                    { roleIsAtLeast: Role.ADMIN, change: "Unterstützung für Ziehl EFR4001IP Zähler" },
                    { roleIsAtLeast: Role.ADMIN, change: "Unterstützung für Weidmüller Modbus/TCP Feldbuskoppler UR20-FBC-MOD-TCP-V2" },
                ],
            },
            {
                version: "2022.10.4",
                changes: [
                    Changelog.app(App.TIME_OF_USE, App.TIBBER) + "Allgemeine Verbesserungen",
                    Changelog.app(App.NETZDIENLICHE_BELADUNG_HC) + "Fehlerbehebung bei der Darstellung der Zielzeit in der richtigen Zeitzone",
                    "Umfangreiche Anpassungen an den Möglichkeiten zur Netzwerkkonfiguration",
                    "Anzeige aktueller Systemstatus-Meldungen, z. B. bei Wartungsarbeiten",
                    "Fehlerbehebung in der Anzeige dreiphasiger historischer Verbrauchs- und Erzeugungsdaten",
                    { roleIsAtLeast: Role.ADMIN, change: "Modbus/TCP-Api-Kompatibilität für KACO 10 und GoodWe-ESS" },
                    { roleIsAtLeast: Role.ADMIN, change: "Bereinigung der Werbewidgets" },
                    { roleIsAtLeast: Role.ADMIN, change: "Verbesserung der Erstinitialisierung von OpenEMS Edge" },
                    { roleIsAtLeast: Role.ADMIN, change: "Fehlerbehebung bei automatischem Reconnect Edge mit Backend" },
                ],
            },
            {
                version: "2022.10.3",
                changes: [
                    Changelog.UI,
                    Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistenten",
                ],
            },
            {
                version: "2022.10.1",
                changes: [
                    Changelog.openems("2022.10.0"),
                    Changelog.product(Product.COMMERCIAL_30) + "Optimierung der Lese- und Regelgeschwindigkeit",
                    Changelog.UI + "Verbesserung der Einstellungsoberfläche für Benachrichtungen",
                    Changelog.app(App.TIME_OF_USE) + "Allgemeine Verbesserungen",
                    { roleIsAtLeast: Role.ADMIN, change: "Fehlerbehebung bei automatischem Reconnect Edge mit Backend" },
                    { roleIsAtLeast: Role.ADMIN, change: "Betatest Edge-2-Edge: https://github.com/OpenEMS/openems/blob/develop/io.openems.edge.edge2edge/readme.adoc" },
                ],
            },
            {
                version: "2022.9.4",
                changes: [
                    Changelog.UI + "Fehlerbehebung bei Übersetzungen",
                    Changelog.app(App.MODBUS_TCP_API) + "Schreibzugriff: Fehlerbehebung bei Registern für das Minimum und Maximum der verfügbaren Speicherleistung",
                ],
            },
            {
                version: "2022.9.2",
                changes: [
                    Changelog.UI,
                    Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistenten",
                    Changelog.app(App.NETZDIENLICHE_BELADUNG_HC) + "Fehlerbehebung in der Darstellung der Live-Daten",
                    Changelog.UI + "Fehlerbehebung bei Farbdarstellung in der historischen Ansicht",
                    Changelog.UI + "Historische Ansicht der eingestellten oder deaktivierten Notstromreserve",
                    { roleIsAtLeast: Role.ADMIN, change: "Aktivieriung ESLint für automatische Prüfung der Codequalität im UI" },
                    { roleIsAtLeast: Role.ADMIN, change: "Anpassung Übersetzungsframework für einfachere Übersetzungen im UI" },
                    { roleIsAtLeast: Role.ADMIN, change: "Refactoring und detaillierte JUnit-Tests der zentralen JsonUtils-Klasse" },
                    { roleIsAtLeast: Role.ADMIN, change: "Battery Soltaro.Single.C: entferne 'Cell Voltage Low Pre-Alarm'" },
                    { roleIsAtLeast: Role.ADMIN, change: "Fehlerbehebung bei automatischem Reconnect Edge mit Backend" },
                    { roleIsAtLeast: Role.ADMIN, change: "Kleine Korrekturen im App Center" },
                    { roleIsAtLeast: Role.ADMIN, change: "In 'Channels' können die gewählten Channels jetzt gespeichert werden" },
                ],
            },
            {
                version: "2022.9.1",
                changes: [
                    Changelog.openems("2022.9.0"),
                    Changelog.UI,
                    Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistenten",
                    Changelog.app(App.MODBUS_TCP_API) + "Schreibzugriff: Zusätzliche Register für das Minimum und Maximum der verfügbaren Speicherleistung",
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.UI + "Verbesserung der Codequalität" },
                    { roleIsAtLeast: Role.ADMIN, change: "Erweiterung der PV-WR Abregelung um phasengenaues Detektieren (Vorerst für dreiphasige PV-WR)" },
                ],
            },
            {
                version: "2022.8.5",
                changes: [
                    Changelog.UI,
                    Changelog.app(App.HOCHLASTZEITFENSTER) + Changelog.GENERAL_OPTIMIZATION,
                    { roleIsAtLeast: Role.ADMIN, change: "Unterstützung von Plexlog Datalogger als Zähler" },
                ],
            },
            {
                version: "2022.8.4",
                changes: [
                    Changelog.product(Product.COMMERCIAL_50, Product.COMMERCIAL_30) + Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistenten",
                    Changelog.app(App.POWER_TO_HEAT, App.HEIZSTAB) + "Überarbeitung des Widgets im Online-Monitoring",
                    Changelog.app(App.TIME_OF_USE) + "Überarbeitung des Widgets im Online-Monitoring",
                    { roleIsAtLeast: Role.INSTALLER, change: Changelog.GENERAL_OPTIMIZATION + " für invertierte Produktionszähler" },
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.UI + " Anzeige von Strom und Spannung für einzelne Erzeuger" },
                    { roleIsAtLeast: Role.ADMIN, change: "Strukturelle Änderungen am Online-Monitoring. Verbesserung der automatischen Tests." },
                ],
            },
            {
                version: "2022.8.3",
                changes: [
                    Changelog.UI,
                ],
            },
            {
                version: "2022.8.2",
                changes: [
                    Changelog.product(Product.COMMERCIAL_50) + "Inbetriebnahmeassistent ist jetzt auch für Commercial 50 verfügbar",
                    Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistent",
                    "Funktion für Systemupdate in den Einstellungen",
                    { roleIsAtLeast: Role.INSTALLER, change: "Anzeige von Strom und Spannung für Erzeuger" },
                    { roleIsAtLeast: Role.ADMIN, change: "Werbewidgets: GLS Crowdfunding" },
                    { roleIsAtLeast: Role.ADMIN, change: "App Center: Info, wenn ein Update zur Verfügung steht" },
                    { roleIsAtLeast: Role.ADMIN, change: "Shelly: Anzeige als Stromzähler" },
                ],
            },
            {
                version: "2022.8.1",
                changes: [
                    Changelog.openems("2022.8.0"),
                    "Optimierung der Stabilität und Leistung des Backends",
                    Changelog.library(Library.NGX_FORMLY),
                    { roleIsAtLeast: Role.ADMIN, change: "Unterstützung für SMA Sunny Island 4.4 und 6" },
                    { roleIsAtLeast: Role.ADMIN, change: "App Center: Verbesserungen" },
                    { roleIsAtLeast: Role.ADMIN, change: "OCPP-Server für Ladesäulen: Fehlerbehebung" },
                ],
            },
            {
                version: "2022.7.5",
                changes: [
                    Changelog.UI,
                ],
            },
            {
                version: "2022.7.3",
                changes: [
                    Changelog.UI,
                    Changelog.product(Product.HOME_10) + "Automatisches Update durch den Inbetriebnahmeassistent",
                    { roleIsAtLeast: Role.ADMIN, change: "GoodWe/Home Charger: Channel CURRENT/VOLTAGE" },
                    { roleIsAtLeast: Role.ADMIN, change: "App Center: App-Icons überarbeitet" },
                    { roleIsAtLeast: Role.ADMIN, change: "UI: generische Überarbeitung Live-Ansicht Verbrauch/Netz" },
                ],
            },
            {
                version: "2022.7.2",
                changes: [
                    Changelog.UI,
                    Changelog.product(Product.HOME_10) + Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistent",
                    { roleIsAtLeast: Role.ADMIN, change: "Fehlerbehebung an Schnittstelle FEMS Backend zu InfluxDB" },
                    { roleIsAtLeast: Role.ADMIN, change: "Fehlerbehebung an SMA ESS" },
                    { roleIsAtLeast: Role.ADMIN, change: "Werbewidgets: fenecon.de/heizstab" },
                    { roleIsAtLeast: Role.ADMIN, change: "Excel-Export gesperrt für Zeiträume > 3 Monate" },
                ],
            },
            {
                version: "2022.7.1",
                changes: [
                    Changelog.openems("2022.7.0"),
                    Changelog.app(App.PV_INVERTER, App.FRONIUS) + "Neue FEMS App",
                    Changelog.product(Product.COMMERCIAL_30) + "Inbetriebnahmeassistent ist jetzt auch für Commercial 30 verfügbar",
                    Changelog.library(Library.INFLUXDB, Library.ANGULAR, Library.IONIC, Library.NGX_FORMLY, Library.D3, Library.NGX_COOKIE_SERVICE,
                        Library.NGX_SPINNER, Library.FASTEXCEL, Library.OKHTTP, Library.OKIO, Library.POSTGRESQL, Library.JNA),
                    { roleIsAtLeast: Role.ADMIN, change: "Werbewidgets: Alerting" },
                    { roleIsAtLeast: Role.ADMIN, change: "Fehlerbehebung bei SunSpec 32-bit Registern" },
                ],
            },
            {
                version: "2022.6.6",
                changes: [
                    Changelog.product(Product.HOME_10) + Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistent",
                    { roleIsAtLeast: Role.ADMIN, change: "Backend-Alerting: Übernahme der FEMS-Nummer und Anpassung UI" },
                    { roleIsAtLeast: Role.ADMIN, change: "App Center: Installation/Deinstallation von Read-Write-/Read-Only-Apps" },
                    { roleIsAtLeast: Role.ADMIN, change: "User-Registrierung: OEM-fähigkeit" },
                    { roleIsAtLeast: Role.ADMIN, change: "TimescaleDB: Weitere Entwicklungen; Test auf fems888" },
                ],
            },
            {
                version: "2022.6.4",
                changes: [
                    Changelog.product(Product.HOME_10) + "Inbetriebnahmeassistent unterstützt die Einbindung eines Rundsteuerempfängers",
                    Changelog.product(Product.COMMERCIAL_30, Product.COMMERCIAL_50) + "Anpassungen für die neueste Batteriegeneration (Gen2)",
                    { roleIsAtLeast: Role.ADMIN, change: "Commercial Gen2-Batterie: Darstellung SoC zwischen 0 und 100 %; Anpassung der Parameter für die Batterie-Protection" },
                    { roleIsAtLeast: Role.ADMIN, change: "'App-Assistent' aus dem UI entfernt. Dieser wird vollständig ersetzt vom neuen App Center" },
                    { roleIsAtLeast: Role.ADMIN, change: "Umfangreiche Verbesserungen am App Center" },
                    { roleIsAtLeast: Role.ADMIN, change: "Fehlerbehebung beim Setzen von Shelly Relais" },
                    { roleIsAtLeast: Role.ADMIN, change: "Fehlerbehebung beim Auslesen der FEMS-Nummber über die Modbus-TCP-Api" },
                    { roleIsAtLeast: Role.ADMIN, change: "Fehlerbehebung für via OCPP eingebundene Ladesäulen (ABL, IES KeyWatt)" },
                    { roleIsAtLeast: Role.ADMIN, change: "Alpha-Tests für neue Zeitreihendatenbank TimescaleDB; diese wird InfluxDB ablösen" },
                    { roleIsAtLeast: Role.ADMIN, change: "Backend-Alerting: Anpassung der Benutzeroberfläche (Settings -> Alarmierung)" },
                ],
            },
            {
                version: "2022.6.3",
                changes: [
                    Changelog.app(App.PV_INVERTER, App.SMA) + "Fehlerbehebung bei der Unterstützung für einphasige SMA-Wechselrichter via SunSpec",
                    { roleIsAtLeast: Role.ADMIN, change: "Der WebSocket Reconnect zum Backend hat jetzt ein weiteres Timeout. Evtl. löst das Probleme, dass sich manche FEMSe nicht mehr verbunden haben." },
                ],
            },
            {
                version: "2022.6.2",
                changes: [
                    Changelog.UI,
                ],
            },
            {
                version: "2022.6.1",
                changes: [
                    Changelog.openems("2022.6.0"),
                    Changelog.app(App.MODBUS_TCP_API) + "Auslesen der FEMS-Nummer über das Register 'Manufacturer EMS Serial Number' (Modbus-Addresse 85)",
                    Changelog.app(App.EVCS_AC, App.KEBA) + "Auslesen der über die DIP-Switches gesetzten Leistungslimitierung",
                    Changelog.app(App.PV_INVERTER, App.SMA) + "Unterstützung für einphasige SMA-Wechselrichter via SunSpec",
                    Changelog.product(Product.HOME_10) + Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistent: Setze 'Vorname Nachname, Ort' als Beschreibung in der Übersicht",
                    Changelog.product(Product.COMMERCIAL_30, Product.COMMERCIAL_50) + Changelog.GENERAL_OPTIMIZATION + " (für Variante 'Cluster C')",
                    { roleIsAtLeast: Role.ADMIN, change: "Fehlerbehebung beim Senden von Daten an das Backend, wenn Component-IDs doppelt vorkommen" },
                    { roleIsAtLeast: Role.ADMIN, change: "Anpassungen am IBN-Assistent: Vorbereitung für IBN-Assistent für Commercial-Serie" },
                    { roleIsAtLeast: Role.ADMIN, change: "Anpassungen am IBN-Assistent: Beschränke Eingabemöglichkeit auf positive Zahlen" },
                    { roleIsAtLeast: Role.ADMIN, change: "Werbewidgets: Optimierung der netzdienlichen Beladung, Energiewende mit FEMS" },
                    { roleIsAtLeast: Role.ADMIN, change: "Vorarbeiten am Backend für Fehler-/Status-Lognachrichten aus dem UI" },
                    { roleIsAtLeast: Role.ADMIN, change: "FENECON Pro 9-12: Ausblenden von unnötigen Statusmeldungen" },
                ],
            },
            {
                version: "2022.5.6",
                changes: [
                    Changelog.UI,
                ],
            },
            {
                version: "2022.5.5",
                changes: [
                    Changelog.UI + "Verbesserung des lokalen Monitorings für historische Daten",
                    { roleIsAtLeast: Role.ADMIN, change: "URL für 'Passwort zurücksetzen' geändert" },
                    { roleIsAtLeast: Role.ADMIN, change: "Backend-Änderungen für Alerting und IBN-Assistent" },
                ],
            },
            {
                version: "2022.5.4",
                changes: [
                    Changelog.app(App.NETZDIENLICHE_BELADUNG_HC) + "Fehlerbehebung wenn keine Produktion verfügbar ist; Verbesserte Darstellung des aktiven Zeitraums in der Historie",
                    "Verbesserte Darstellung des aktiven Zeitraums in der Historie",
                    Changelog.library(Library.POSTGRESQL),
                    { roleIsAtLeast: Role.ADMIN, change: "Refactoring des Component-Managers" },
                    { roleIsAtLeast: Role.ADMIN, change: "UI-Verbesserung am System-Update" },
                ],
            },
            {
                version: "2022.5.2",
                changes: [
                    Changelog.app(App.NETZDIENLICHE_BELADUNG_HC) + "Allgemeine Verbesserungen; Sicherstellung einer minimalen Beladeleistung",
                    Changelog.product(Product.PRO_HYBRID_10) + "Kompatibilität mit KACO Firmware Version 8 (nur lesend)",
                    Changelog.product(Product.COMMERCIAL_30, Product.COMMERCIAL_50) + "Fehlerbehebung in der Anzeige bei Ladezustand 0 %",
                    Changelog.product(Product.COMMERCIAL_30) + "Verbesserung an Implementierung Sinexcel (Ländereinstellung, Notstrom)",
                    { roleIsAtLeast: Role.ADMIN, change: "Umbenennung SolarEdge PV-Inverter und Meter" },
                    { roleIsAtLeast: Role.ADMIN, change: "Prüfung auf Apikey (/etc/fems und Controller.Api.Backend) -> neuer Channel ctrlBackend0/WrongApikeyConfiguration" },
                    { roleIsAtLeast: Role.ADMIN, change: "Fehlerbehebung an Schnittstelle FEMS Backend zu InfluxDB" },
                    { roleIsAtLeast: Role.ADMIN, change: "FEMS-Authentifizierung am Backend: entferne Leerzeichen von Apikey" },
                ],
            },
            {
                version: "2022.5.1",
                changes: [
                    Changelog.openems("2022.5.0"),
                    Changelog.app(App.POWER_TO_HEAT, App.HEIZSTAB) + "Korrektur der Anzeige des Betriebsstundenzählers in der historischen Darstellung",
                    Changelog.app(App.NETZDIENLICHE_BELADUNG_HC) + "Korrektur der Anzeige des Betriebsstundenzählers in der historischen Darstellung",
                    Changelog.library(Library.INFLUXDB),
                    Changelog.UI + "Fehlerbehebung bei Konfiguration von Uhrzeiten",
                    { roleIsAtLeast: Role.ADMIN, change: "Soltaro-Batterien Version C: PreAlarmCellVoltageHigh und PreAlarmTotalVoltageHigh ausgeblendet" },
                    { roleIsAtLeast: Role.ADMIN, change: "Commercial Gen2-Batterie: Warning, CommunicationStopCharging, CommunicationStopDischarging ausgeblendet" },
                    { roleIsAtLeast: Role.ADMIN, change: "Verbesserung 'Virtual Subtract Meter'" },
                    { roleIsAtLeast: Role.ADMIN, change: "Fehlerbehebung an Schnittstelle FEMS Backend zu InfluxDB" },
                ],
            },
            {
                version: "2022.4.1",
                changes: [
                    Changelog.openems("2022.4.0"),
                    Changelog.app(App.TIME_OF_USE) + "Allgemeine Verbesserung",
                    Changelog.library(Library.INFLUXDB, Library.ANGULAR, Library.IONIC, Library.GRADLE, Library.APACHE_FELIX_CONFIGADMIN, Library.D3),
                    "Mehrsprachiger Excel-Export aus dem Online-Monitoring",
                    Changelog.product(Product.COMMERCIAL_30) + "Fehlerbehebungen und Berechnung von Energie-Werten",
                    Changelog.UI + "Verbesserung der Anzeige von Verbrauchs- und Erzeugungszählern",
                    Changelog.UI + "Refactoring der Charts für historische Daten",
                    Changelog.openemsComponent(OpenemsComponent.SDM630_ZAEHLER, "Korrektur der Modbus-Register für Blindleistung"),
                    { roleIsAtLeast: Role.ADMIN, change: "Umfangreiche Verbesserungen am FEMS App Center (Beta-Test)" },
                    { roleIsAtLeast: Role.ADMIN, change: "Benachrichtigung bei Ausfall eines FEMS (Beta-Test)" },
                    { roleIsAtLeast: Role.ADMIN, change: "Neues Werbewidget für direkte Anbindung eines KOSTAL PV-Wechselrichter" },
                ],
            },
            {
                version: "2022.3.6",
                changes: [
                    Changelog.library(Library.INFLUXDB),
                ],
            },
            {
                version: "2022.3.3",
                changes: [
                    Changelog.product(Product.HOME_10) + Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistent: Responsive Größe des Eingabefensters, besser lesbare PV-Ausrichtung im IBN-Protokoll",
                    Changelog.app(App.POWER_TO_HEAT, App.HEIZSTAB) + "Kontinuierliche Aufsummierung der Betriebsstunden je Level",
                    Changelog.UI + "Fehlerbehebungen in der Darstellung der historischen Daten",
                    Changelog.product(Product.COMMERCIAL_30, Product.COMMERCIAL_50) + "Anpassungen für die neueste Batteriegeneration (Gen2)",
                    Changelog.app(App.PV_INVERTER, App.KOSTAL) + "Kompatibilität mit Kostal PV-Wechselrichtern. Getestet mit Kostal Plenticore 5.5 und Pico 5.5",
                    Changelog.library(Library.INFLUXDB),
                    { roleIsAtLeast: Role.ADMIN, change: "Zusammenlegung der FEMS System-Update Funktion, je nach installierter FEMS-Version" },
                    { roleIsAtLeast: Role.ADMIN, change: "Umfangreiche Verbesserungen am FEMS App Center (Beta-Test)" },
                ],
            },
            {
                version: "2022.3.2",
                changes: [
                    Changelog.UI,
                ],
            },
            {
                version: "2022.3.1",
                changes: [
                    Changelog.openems("2022.3.0"),
                    Changelog.UI + "Anzeigen/Ändern der Kontaktdaten im Benutzer-Menü",
                    Changelog.UI + "Beim Login mit Benutzername/E-Mail-Adresse wird die Groß-/Kleinschreibung ignoriert",
                    Changelog.app(App.NETZDIENLICHE_BELADUNG_HC) + "Überarbeitung des Widgets im Online-Monitoring",
                    Changelog.product(Product.PRO_HYBRID_10) + "Kompatibilität mit KACO Firmware Version 8 (nur lesend)",
                    Changelog.app(App.MODBUS_TCP_API) + "Auslesen On-Grid-/Off-Grid-Modus + Überarbeitung der Beschreibungen in der Excel-Datei",
                    Changelog.app(App.PV_INVERTER, App.FRONIUS) + "Kompatibilität mit Fronius PV-Wechselrichtern. Getestet mit Fronius Symo",
                    Changelog.library(Library.SLF4J, Library.POSTGRESQL, Library.GSON, Library.GUAVA, Library.NGX_FORMLY),
                ],
            },
            {
                version: "2022.2.3",
                changes: [
                    Changelog.UI,
                ],
            },
            {
                version: "2022.2.2",
                changes: [
                    Changelog.product(Product.HOME_10) + Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistent: Dynamische Begrenzung der Netzeinspeiseleistung in Österreich",
                    Changelog.app(App.NETZDIENLICHE_BELADUNG_HC) + "Änderungen an der maximalen Netzeinspeiseleistung müssen durch erneutes Ausführen des Inbetriebnahmeassistenten gesetzt werden",
                ],
            },
            {
                version: "2022.2.1",
                changes: [
                    Changelog.openems("2022.2.0"),
                    Changelog.app(App.TIME_OF_USE) + "Verbesserung der Einberechnung der Notstromvorhaltung und von DC-/Hybrid-Speichersystemen",
                    Changelog.library(Library.FASTEXCEL, Library.SLF4J, Library.D3, Library.NGX_FORMLY, Library.APACHE_FELIX_CONFIGADMIN),
                ],
            },
            {
                version: "2022.1.3",
                changes: [
                    Changelog.app(App.HOCHLASTZEITFENSTER) + "Kompatibilität des Hochlastzeitfensters mit Blindleistungsregelung",
                    Changelog.product(Product.HOME_10) + Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistent: Eingabe der Installateursdaten, externer Optimierer (Schattenmanagement)",
                    Changelog.product(Product.HOME_10, Product.PRO_HYBRID_GW, Product.PRO_HYBRID_AC_GW) + "Möglichkeit zur Deaktivierung des MPP-Trackers bei externen Optimierern",
                    Changelog.product(Product.HOME_10) + "Verbesserung des 'SMART'-Mode",
                    { roleIsAtLeast: Role.ADMIN, change: "Verbesserung an FEMS System-Update Funktion" },
                    { roleIsAtLeast: Role.ADMIN, change: "Bugfix OCPP-Server mit Java 11" },
                ],
            },
            {
                version: "2022.1.2",
                changes: [
                    Changelog.app(App.TIME_OF_USE) + "Verbesserung der historischen Darstellung über einen längeren Zeitraum",
                ],
            },
            {
                version: "2022.1.1",
                changes: [
                    Changelog.openems("2022.1.0"),
                    Changelog.product(Product.HOME_10, Product.PRO_HYBRID_GW, Product.PRO_HYBRID_AC_GW) + "Verbesserung des 'SMART'-Mode",
                    Changelog.library(Library.RRD4J, Library.PAX_LOGGING, Library.GRADLE, Library.ANGULAR, Library.NGX_FORMLY, Library.IONIC, Library.DATE_FNS, Library.FASTEXCEL, Library.HIKARI_CP),
                    "Ab dem Jahr 2022 steht die zweite Zahl in der Versionsnummer für den Monat des Releases; 2022.1.1 wurde also im Januar 2022 veröffentlicht",
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.EDGE + " Start Beta-Test App-Manager für FENECON Home" },
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.BACKEND + " Setze in Odoo Tag beim Partner, wenn dieser über IBN-Assistent angelegt wurde" },
                ],
            },
            {
                version: "2021.22.1",
                changes: [
                    Changelog.openems("2021.22.0"),
                    Changelog.product(Product.HOME_10) + Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistent für FEMS-App SG-Ready Wärmepumpe",
                    Changelog.product(Product.PRO_HYBRID_10) + "Fehlerbehebung beim Erfassen der Seriennummer",
                    "Implementierung Siemens PAC2200/3200/4200 Zähler",
                    Changelog.library(Library.PAX_LOGGING),
                    "Aktualisierung auf Log4j Version 2 mit aktualiserten Sicherheitspatches. Vorher wurde Log4j in Version 1 genutzt, die für die kritische Schwachstelle an Log4j (CVE-2021-44228) ebenfalls nicht anfällig war.",
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.EDGE + " PV-Wechselrichter und DC-Laderegler können für Modbus/TCP-Slave-Api freigegeben werden" },
                ],
            },
            {
                version: "2021.21.5",
                changes: [
                    Changelog.product(Product.HOME_10) + Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistent über das Online-Monitoring",
                    Changelog.library(Library.APACHE_FELIX_HTTP_JETTY, Library.APACHE_FELIX_FRAMEWORK, Library.D3, Library.DATE_FNS),
                    { roleIsAtLeast: Role.ADMIN, change: "SimulatedESS: Modbus-Protokoll ist jetzt gleich wie GenericManagedSymmetricEss" },
                ],
            },
            {
                version: "2021.21.4",
                changes: [
                    Changelog.library(Library.PAX_LOGGING) + " (CVE-2021-44228)",
                ],
            },
            {
                version: "2021.21.3",
                changes: [
                    Changelog.app(App.TIME_OF_USE) + Changelog.GENERAL_OPTIMIZATION,
                    Changelog.product(Product.HOME_10) + "Fehlerbehebung 'Q von U' Kurve",
                    { roleIsAtLeast: Role.ADMIN, change: "Werbungswidgets im Monitoring werden nur noch für FENECON angezeigt, nicht für OEM (z. B. Heckert)" },
                ],
            },
            {
                version: "2021.21.2",
                changes: [
                    Changelog.product(Product.PRO_HYBRID_10) + "Fehlerbehebung für Java 11",
                ],
            },
            {
                version: "2021.21.1",
                changes: [
                    Changelog.openems("2021.21.0"),
                    Changelog.UI + "Entferne Leerzeichen bei Login mit Benutzername und Passwort.",
                    Changelog.product(Product.HOME_10) + Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistent über das Online-Monitoring",
                    Changelog.library(Library.JNA, Library.IONIC, Library.NGX_FORMLY, Library.DATE_FNS, Library.GRADLE),
                    "Aktualisierung auf Java 11",
                    { roleIsAtLeast: Role.ADMIN, change: "InfluxDB: erhöhe Timeout für Abfragen" },
                ],
            },
            {
                version: "2021.20.1",
                changes: [
                    Changelog.openems("2021.20.0"),
                    Changelog.app(App.TIME_OF_USE, App.CORRENTLY) + "In Abstimmung mit STOMDAO können jetzt 15-Minuten Werte genutzt werden.",
                    Changelog.app(App.TIME_OF_USE, App.TIBBER) + "Release",
                    Changelog.product(Product.DESS) + "Fehlerbehebung bei DC-PV-Leistung",
                    "Fehlerbehebung bei Berechnung der Kapazität in einem Cluster aus Speichersystemen",
                ],
            },
            {
                version: "2021.19.6",
                changes: [
                    Changelog.product(Product.HOME_10) + "Erkennung für FENECON Batteriewechselrichter",
                ],
            },
            {
                version: "2021.19.5",
                changes: [
                    Changelog.app(App.TIME_OF_USE) + Changelog.GENERAL_OPTIMIZATION,
                ],
            },
            {
                version: "2021.19.3",
                changes: [
                    Changelog.UI,
                    Changelog.product(Product.HOME_10, Product.PRO_HYBRID_10, Product.PRO_HYBRID_GW, Product.PRO_HYBRID_AC_GW) + Changelog.GENERAL_OPTIMIZATION,
                    Changelog.app(App.EVCS_AC, App.KEBA) + "Kein Fehler, wenn IP-Adresse Leerzeichen am Anfang oder Ende enthält",
                ],
            },
            {
                version: "2021.19.2",
                changes: [
                    Changelog.UI,
                ],
            },
            {
                version: "2021.19.1",
                changes: [
                    Changelog.openems("2021.19.0"),
                    Changelog.product(Product.COMMERCIAL_30, Product.COMMERCIAL_50) + Changelog.GENERAL_OPTIMIZATION + " (für Varianten 'Cluster B', 'Single C' und 'Cluster C')",
                    Changelog.UI + " (Detail-Widgets)",
                    Changelog.product(Product.HOME_10) + Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistent über das Online-Monitoring (OEM)",
                    Changelog.product(Product.COMMERCIAL_30) + " Überarbeitung der Implementierung für den Sinexcel Batteriewechselrichter",
                    Changelog.library(Library.GSON, Library.POSTGRESQL, Library.OSGI_SERVICE_JDBC, Library.DATE_FNS, Library.D3, Library.INFLUXDB),
                    { roleIsAtLeast: Role.ADMIN, change: "Beta-Test für neue FEMS System-Update Funktion" },
                ],
            },
            {
                version: "2021.18.1",
                changes: [
                    Changelog.openems("2021.18.0"),
                    Changelog.app(App.EVCS_AC) + "Verbesserung der Kompatibilität mit nicht aktiv gesteuerten Stromspeichersytemen",
                    Changelog.product(Product.HOME_10) + Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistent über das Online-Monitoring",
                    Changelog.app(App.TIME_OF_USE) + Changelog.GENERAL_OPTIMIZATION,
                    Changelog.openemsComponent(OpenemsComponent.PQ_PLUS_ZAEHLER, "Kompatibilität mit PQ Plus UMD96"),
                    "Fehlerbehebung in der Datenaufzeichnung phasengenauer Blindleistung",
                    Changelog.library(Library.OSGI_UTIL_PROMISE, Library.OSGI_UTIL_FUNCTION, Library.POSTGRESQL, Library.GUAVA),
                ],
            },
            {
                version: "2021.17.1",
                changes: [
                    Changelog.openems("2021.17.0"),
                    Changelog.UI + "Permanentes Speichern der Spracheinstellung",
                    Changelog.app(App.PV_INVERTER, App.SMA) + "Fehlerbehebung der Darstellung im Online-Monitoring",
                    Changelog.product(Product.COMMERCIAL_30) + Changelog.GENERAL_OPTIMIZATION,
                    Changelog.app(App.TIME_OF_USE) + "Darstellung im Online-Monitoring",
                    Changelog.app(App.EVCS_AC, App.HARDY_BARTH) + Changelog.GENERAL_OPTIMIZATION,
                    Changelog.product(Product.HOME_10, Product.PRO_HYBRID_GW, Product.PRO_HYBRID_AC_GW) + "Konfiguration des minimalen Ladezustands im Off-Grid-Fall; "
                    + "Aufzeichnung des notstromversorgten Energieverbrauchs",
                    Changelog.product(Product.COMMERCIAL_30, Product.COMMERCIAL_50) + Changelog.GENERAL_OPTIMIZATION + " (für Variante 'Single C')",
                ],
            },
            {
                version: "2021.16.5",
                changes: [
                    Changelog.UI,
                    Changelog.product(Product.COMMERCIAL_30) + Changelog.GENERAL_OPTIMIZATION,
                    Changelog.product(Product.HOME_10, Product.PRO_HYBRID_GW, Product.PRO_HYBRID_AC_GW) + Changelog.GENERAL_OPTIMIZATION,
                    Changelog.EDGE + Changelog.GENERAL_OPTIMIZATION,
                    { roleIsAtLeast: Role.ADMIN, change: "Implementierung ESS Cycle-Controller für Zyklus- und Kapazitätstests" },
                ],
            },
            {
                version: "2021.16.4",
                changes: [
                    Changelog.product(Product.COMMERCIAL_30) + "Umstellung der Software-Architektur",
                    {
                        roleIsAtLeast: Role.ADMIN, change: "Ab dieser Version muss der Sinexcel Wechselrichter als Battery-Inverter angelegt werden; "
                            + "je nach Anwendungsfall zusammen mit einem 'ESS Generic Off Grid' oder einem 'ESS Generic Managed Symmetric'",
                    },
                    Changelog.EDGE + "Fehlermeldung bei Modbus-Kommunikationsabbruch wird bei dem Gerät und nicht mehr bei der Modbus-Bridge angezeigt",
                ],
            },
            {
                version: "2021.16.3",
                changes: [
                    Changelog.UI,
                    Changelog.app(App.TIME_OF_USE, App.AWATTAR) + Changelog.GENERAL_OPTIMIZATION,
                    Changelog.product(Product.PRO_HYBRID_10) + "Verbesserung der Fehleranalyse für die interne Eigenverbrauchsoptimierung",
                    Changelog.app(App.SCHWELLWERTSTEUERUNG) + Changelog.GENERAL_OPTIMIZATION,
                    Changelog.app(App.REST_JSON_API) + Changelog.GENERAL_OPTIMIZATION,
                    Changelog.product(Product.HOME_10) + "Verbesserungen an der Notstromfunktion",
                ],
            },
            {
                version: "2021.16.2",
                changes: [
                    Changelog.app(App.SCHWELLWERTSTEUERUNG) + "Parallele Ansteuerung mehrerer Relaisausgänge",
                ],
            },
            {
                version: "2021.16.1",
                changes: [
                    Changelog.openems("2021.16.0"),
                    Changelog.UI,
                    Changelog.product(Product.HOME_10) + "Verbesserungen an der Notstromfunktion: Algorithmus zur Vorhaltung einer Notstromreserve; einstellbar via IBN-Assistent oder über das Widget 'Speichersystem' im Online-Monitoring",
                    Changelog.product(Product.COMMERCIAL_30, Product.COMMERCIAL_50) + "Verbesserung der Fehlermeldung bei Kommunikationsabbruch (Cluster Version B)",
                    Changelog.library(Library.GRADLE),
                    Changelog.app(App.NETZDIENLICHE_BELADUNG_HC) + Changelog.GENERAL_OPTIMIZATION,
                    Changelog.product(Product.HOME_10) + "Fehlerbehebung bei der Start-Prozedur",
                    { roleIsAtLeast: Role.ADMIN, change: "Die 'openems.jar'-Datei für jeden Branch wird jetzt automatisch bei jedem 'push' gebaut. Download unter 'https://dev.intranet.fenecon.de/{branch}/openems.jar'" },
                    { roleIsAtLeast: Role.ADMIN, change: "Mit einer Konfigurationseinstellungen in der 'Sum'-Komponente können jetzt Warnungen und Fehler des Gesamtsystems ignoriert/ausgeblendet werden" },
                    { roleIsAtLeast: Role.ADMIN, change: "Der Debug-Log-Controller kann so konfiguriert werden, dass er auch den Alias mit ausgibt" },
                ],
            },
            {
                version: "2021.15.12",
                changes: [
                    Changelog.product(Product.HOME_10, Product.PRO_HYBRID_GW, Product.PRO_HYBRID_AC_GW) + "Verbrauchszähler für notstromversorgte Lasten ('GoodWe.EmergencyPowerMeter'); Bei aktiviertem Notstrom aktiviere auch Schwarzstart-Funktion",
                    Changelog.product(Product.HOME_10) + Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistent über das Online-Monitoring",
                    Changelog.product(Product.HOME_10) + "Optimierung der Start-Prozedur und des Fehlerhandlings der Batterie",
                    Changelog.product(Product.HOME_10, Product.COMMERCIAL_30, Product.COMMERCIAL_50) + Changelog.BATTERY_PROTECTION,
                    Changelog.EDGE + "Fehlerbehebung am lokalen Monitoring",
                    Changelog.library(Library.APACHE_FELIX_SCR, Library.FASTEXCEL),
                ],
            },
            {
                version: "2021.15.11",
                changes: [
                    Changelog.UI,
                ],
            },
            {
                version: "2021.15.10",
                changes: [
                    Changelog.openems("2021.15.0"),
                    Changelog.product(Product.HOME_10, Product.PRO_HYBRID_GW, Product.PRO_HYBRID_AC_GW) + "Prüfung im 'SMART'-Mode, ob das erforderliche GoodWe Smart-Meter verbunden ist",
                ],
            },
            {
                version: "2021.15.9",
                changes: [
                    Changelog.app(App.MODBUS_TCP_API) + "Verbessertes Fehlerhandling bei ungültigen Anfragen; neuer Fehlerzustand 'Fault in Process Image'",
                ],
            },
            {
                version: "2021.15.8",
                changes: [
                    Changelog.product(Product.HOME_10) + "Prüfung im 'SMART'-Mode, ob das erforderliche GoodWe Smart-Meter verbunden ist",
                ],
            },
            {
                version: "2021.15.7",
                changes: [
                    Changelog.UI,
                    Changelog.product(Product.HOME_10) + Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistent über das Online-Monitoring",
                    Changelog.app(App.REST_JSON_API) + "Optimierung bei Verwendung regulärer Ausdrücke",
                    Changelog.product(Product.INDUSTRIAL_M) + "Release ESS Standby-Controller",
                    Changelog.EDGE + "Fehlerbehebung nach Update der Apache Felix Webconsole",
                    Changelog.library(Library.APACHE_FELIX_HTTP_JETTY),
                    { roleIsAtLeast: Role.ADMIN, change: "Entfernen von KACO50.ESS aus dem Release" },
                ],
            },
            {
                version: "2021.15.6",
                changes: [
                    Changelog.EDGE + "Fehlerbehebung bei Datenkonvertierung sehr großer Zahlen",
                    Changelog.product(Product.COMMERCIAL_30, Product.COMMERCIAL_50) + "Verbesserung der Aufzeichnung von Zellspannungen",
                    Changelog.app(App.NETZDIENLICHE_BELADUNG_HC) + Changelog.GENERAL_OPTIMIZATION,
                    Changelog.app(App.EVCS_AC, App.HARDY_BARTH) + "Verwende werkseitige Standard-IP 192.168.25.30",
                    Changelog.product(Product.HOME_10, Product.PRO_HYBRID_GW, Product.PRO_HYBRID_AC_GW) + Changelog.GENERAL_OPTIMIZATION,
                ],
            },
            {
                version: "2021.15.5",
                changes: [
                    Changelog.GENERAL_OPTIMIZATION,
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.product(Product.PRO_HYBRID_GW, Product.PRO_HYBRID_AC_GW) + "Fehlerbehebung für übersteuerte Systeme; setze standardmäßig auf 'INTERNAL'- anstelle von 'SMART'-Mode" },
                ],
            },
            {
                version: "2021.15.4",
                changes: [
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.product(Product.PRO_HYBRID_GW, Product.PRO_HYBRID_AC_GW) + "Fehlerbehebung für übersteuerte Systeme" },
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.EDGE + "Änderung der Berechtigung zum Setzen von Netzwerkeinstellungen auf 'owner'; notwendig für IBN-Assistent Heckert bei FEMS-Apps" },
                ],
            },
            {
                version: "2021.15.3",
                changes: [
                    Changelog.product(Product.HOME_10) + Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistent über das Online-Monitoring (Konfiguration AC-PV-Zähler)",
                ],
            },
            {
                version: "2021.15.2",
                changes: [
                    Changelog.GENERAL_OPTIMIZATION,
                    { roleIsAtLeast: Role.ADMIN, change: "Version übersprungen" },
                ],
            },
            {
                version: "2021.15.1",
                changes: [
                    Changelog.GENERAL_OPTIMIZATION,
                    { roleIsAtLeast: Role.ADMIN, change: "Version übersprungen" },
                ],
            },
            {
                version: "2021.14.1",
                changes: [
                    Changelog.openems("2021.14.0"),
                    Changelog.product(Product.HOME_10) + Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistent über das Online-Monitoring",
                    Changelog.UI + "Neustrukturierung des Anlagenprofils",
                    Changelog.product(Product.HOME_10) + Changelog.GENERAL_OPTIMIZATION,
                    Changelog.library(Library.CHARGETIME_OCPP, Library.GSON, Library.JNA, Library.PAX_LOGGING),
                    { roleIsAtLeast: Role.ADMIN, change: "OEM-Version des Online-Monitorings für Heckert: " + Changelog.link("Link", "https://symphon-e.heckert-solar.com/") },
                ],
            },
            {
                version: "2021.13.10",
                changes: [
                    Changelog.product(Product.HOME_10) + Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistent über das Online-Monitoring",
                    Changelog.EDGE + "Fehlerbehebung nach Update des OSGi-Frameworks",
                    { roleIsAtLeast: Role.ADMIN, change: "Fehlerbehebung bei Prüfung auf fehlerhaftes, doppeltes Mapping von Modbus-Register zu Channel" },
                    { roleIsAtLeast: Role.ADMIN, change: "UI-Entwicklungen werden per Continuous Integration immer sofort unter https://dev.intranet.fenecon.de/feature/ui- ... zur Verfügung gestellt" },
                ],
            },
            {
                version: "2021.13.9",
                changes: [
                    Changelog.product(Product.HOME_10) + Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistent über das Online-Monitoring",
                    Changelog.library(Library.D3, Library.NGX_COOKIE_SERVICE, Library.MYDATEPICKER),
                    "Similar-Day Predictor. Übernahme aus dem Forschungsprojekt " + Changelog.link("EMSIG", "https://openems.io/research/emsig/"),
                    Changelog.EDGE + "Fehlerbehebung am lokalen Monitoring",
                    Changelog.BACKEND + "Spracheinstellungen für Benutzer",
                    { roleIsAtLeast: Role.ADMIN, change: "Fehlerbehebung bei Prüfung auf fehlerhaftes, doppeltes Mapping von Modbus-Register zu Channel" },
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.UI + "Werbungs-Widget: Ändere E-Mail zu partner@fenecon.de" },
                ],
            },
            {
                version: "2021.13.8",
                changes: [
                    Changelog.product(Product.HOME_10) + Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistent über das Online-Monitoring",
                ],
            },
            {
                version: "2021.13.7",
                changes: [
                    Changelog.GENERAL_OPTIMIZATION,
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.EDGE + "Ändere SystemUpdate zu neuem Paket 'fems'; 'openems-core' und 'openems-core-fems' sind obsolet" },
                    { roleIsAtLeast: Role.ADMIN, change: Changelog.UI + "Reaktivierung des Werbungs-Widgets" },
                ],
            },
            {
                version: "2021.13.6",
                changes: [
                    Changelog.app(App.EVCS_AC) + "Fehlerbehebung bei Limitierung der maximalen Energie eines Ladevorgangs",
                    Changelog.UI + Changelog.GENERAL_OPTIMIZATION + "Jahresansicht in der Historie",
                    Changelog.product(Product.HOME_10) + Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistent über das Online-Monitoring",
                ],
            },
            {
                version: "2021.13.5",
                changes: [
                    Changelog.UI + "Jahresansicht in der Historie",
                ],
            },
            {
                version: "2021.13.4",
                changes: [
                    Changelog.product(Product.PRO_HYBRID_10) + "Fehlerbehebung bei ungültiger Seriennummer oder Version des Wechselrichters",
                ],
            },
            {
                version: "2021.13.3",
                changes: [
                    Changelog.EDGE + "Datenkonvertierung von Array-Werten",
                    Changelog.product(Product.HOME_10) + Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistent über das Online-Monitoring",
                    Changelog.app(App.METER, App.JANITZA) + Changelog.GENERAL_OPTIMIZATION,
                    { roleIsAtLeast: Role.ADMIN, change: "Refactoring von ESS Cluster: sofortige Übernahme von Channel-Werten, Berechnung gewichteter SoC anhand der Kapazität" },
                    { roleIsAtLeast: Role.ADMIN, change: "Switch zu Apache Felix Framework" },
                ],
            },
            {
                version: "2021.13.2",
                changes: [
                    Changelog.UI + "Übersetzungen",
                    Changelog.UI + "Portal zur Registrierung als Benutzer",
                    Changelog.library(Library.SLF4J),
                ],
            },
            {
                version: "2021.13.1",
                changes: [
                    Changelog.openems("2021.13.0"),
                    Changelog.app(App.NETZDIENLICHE_BELADUNG_HC) + Changelog.GENERAL_OPTIMIZATION,
                    Changelog.app(App.METER, App.JANITZA) + Changelog.GENERAL_OPTIMIZATION,
                    Changelog.GENERAL_OPTIMIZATION + " an Beta-Version für go-e Charger Home",
                    Changelog.EDGE + "Verarbeitung 'read-only' Modus von Speichersystemen",
                    Changelog.library(Library.DATE_FNS, Library.ANGULAR, Library.IONIC, Library.NGX_COOKIE_SERVICE, Library.RXJS),
                ],
            },
            {
                version: "2021.12.6",
                changes: [
                    Changelog.BACKEND + "Spracheinstellungen für Benutzer",
                    Changelog.product(Product.HOME_10) + Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistent über das Online-Monitoring",
                    Changelog.app(App.EVCS_AC) + Changelog.GENERAL_OPTIMIZATION,
                    "Beta-Version für go-e Charger Home",
                ],
            },
            {
                version: "2021.12.5",
                changes: [
                    Changelog.product(Product.HOME_10) + Changelog.GENERAL_OPTIMIZATION + " am Inbetriebnahmeassistent über das Online-Monitoring",
                ],
            },
            {
                version: "2021.12.4",
                changes: [
                    Changelog.library(Library.CHARGETIME_OCPP),
                ],
            },
            {
                version: "2021.12.3",
                changes: [
                    Changelog.app(App.NETZDIENLICHE_BELADUNG_HC) + Changelog.GENERAL_OPTIMIZATION,
                ],
            },
            {
                version: "2021.12.2",
                changes: [
                    Changelog.UI + "Portal zur Registrierung als Benutzer",
                    Changelog.product(Product.HOME_10) + "Release Inbetriebnahmeassistent über das Online-Monitoring",
                    Changelog.app(App.METER, App.JANITZA) + Changelog.GENERAL_OPTIMIZATION,
                ],
            },
            {
                version: "2021.12.1",
                changes: [
                    Changelog.UI,
                    Changelog.BACKEND + "Inbetriebnahmeassistent",
                    Changelog.app(App.PV_INVERTER, App.SMA) + "Kompatibilität mit SMA Sunny Tripower 8.0 und 10.0",
                    { roleIsAtLeast: Role.ADMIN, change: "Prüfung auf fehlerhaftes, doppeltes Mapping von Modbus-Register zu Channel" },
                    Changelog.library(Library.POSTGRESQL, Library.UUID, Library.ECLIPSE_OSGI, Library.GSON, Library.NG2_CHARTS, Library.NGX_FORMLY, Library.MYDATEPICKER),
                ],
            },
            {
                version: "2021.11.3",
                changes: [
                    Changelog.UI,
                    { roleIsAtLeast: Role.ADMIN, change: "FixActivePower-Controller reagiert schneller auf Änderungen (via @Modified)" },
                ],
            },
            {
                version: "2021.11.2",
                changes: [
                    Changelog.UI,
                ],
            },
            {
                version: "2021.11.1",
                changes: [
                    Changelog.openems("2021.11.0"),
                    Changelog.library(Library.MSGPACK, Library.FASTEXCEL, Library.APACHE_FELIX_INVENTORY,
                        Library.ANGULAR, Library.IONIC, Library.NGX_FORMLY, Library.D3, Library.DATE_FNS, Library.NGX_COOKIE_SERVICE, Library.NGX_SPINNER, Library.RXJS),
                    { roleIsAtLeast: Role.ADMIN, change: "Möglichkeit zum Export aller aktuellen Channel-Werte als Excel-Datei. Link im Anlagenprofil unter der jeweiligen Komponente." },
                    { roleIsAtLeast: Role.ADMIN, change: "Entfernen von Refu.ESS und Streetscooter.ESS aus dem Release" },
                    { roleIsAtLeast: Role.ADMIN, change: "Downgrade Soltaro Single A 'Connector Wire Fault' zu Level 'Warnung'" },
                ],
            },
            {
                version: "2021.10.9",
                changes: [
                    Changelog.UI + "Anpassungen für neue FENECON Corporate Identity",
                    Changelog.EDGE + "Vereinheitlichung von AC, DC und Hybrid-Speichern",
                    Changelog.app(App.MODBUS_TCP_API) + "Bereitstellung von DC-Leistung und -Energie für Hybrid-Speicher",
                    Changelog.library(Library.GRADLE, Library.APACHE_FELIX_HTTP_JETTY, Library.POSTGRESQL),
                ],
            },
            {
                version: "2021.10.8",
                changes: [
                    Changelog.product(Product.DESS) + "Erfassung Ladezustand",
                ],
            },
            {
                version: "2021.10.7",
                changes: [
                    Changelog.UI,
                ],
            },
            {
                version: "2021.10.6",
                changes: [
                    Changelog.BACKEND + "Inbetriebnahmeassistent",
                ],
            },
            {
                version: "2021.10.5",
                changes: [
                    Changelog.UI,
                    Changelog.EDGE + "Datenkonvertierung von String-Werten",
                    "Simulator: Verbesserung der Ladezustandsberechnung",
                ],
            },
            {
                version: "2021.10.4",
                changes: [
                    Changelog.app(App.NETZDIENLICHE_BELADUNG_HC) + Changelog.GENERAL_OPTIMIZATION,
                ],
            },
            {
                version: "2021.10.3",
                changes: [
                    Changelog.app(App.NETZDIENLICHE_BELADUNG_HC) + Changelog.GENERAL_OPTIMIZATION,
                ],
            },
            {
                version: "2021.10.2",
                changes: [
                    Changelog.EDGE + "Datenkonvertierung von Boolean-Werten",
                ],
            },
            {
                version: "2021.10.1",
                changes: [
                    Changelog.openems("2021.10.0"),
                    Changelog.UI,
                    Changelog.EDGE,
                    Changelog.library(Library.IONIC, Library.NGX_FORMLY, Library.MYDATEPICKER, Library.D3, Library.DATE_FNS, Library.NGX_SPINNER, Library.RXJS, Library.GRADLE),
                    Changelog.product(Product.HOME_10) + Changelog.GENERAL_OPTIMIZATION,
                    Changelog.app(App.NETZDIENLICHE_BELADUNG_HC) + "Release",
                ],
            },
            {
                version: "2021.9.3",
                changes: [
                    Changelog.UI,
                    Changelog.product(Product.PRO_HYBRID_GW, Product.PRO_HYBRID_AC_GW) + Changelog.GENERAL_OPTIMIZATION,
                    Changelog.library(Library.GRADLE),
                ],
            },
            {
                version: "2021.9.2",
                changes: [
                    Changelog.UI,
                    Changelog.EDGE + "Erfassung lokaler Hostname",
                ],
            },
            {
                version: "2021.9.1",
                changes: [
                    Changelog.openems("2021.9.0"),
                    Changelog.EDGE + "lokale Netzwerkkonfiguration, verbesserte Zugriffskontrolle",
                    Changelog.app(App.METER, App.SOCOMEC) + "Implementierung SOCOMEC Countis E34",
                    { roleIsAtLeast: Role.ADMIN, change: "Lokaler Login als 'admin' nur noch mit FEMS-spezifischem Passwort" },
                ],
            },
            {
                version: "2021.8.9",
                changes: [
                    Changelog.UI,
                ],
            },
            {
                version: "2021.8.8",
                changes: [
                    Changelog.UI,
                    Changelog.product(Product.HOME_10) + Changelog.GENERAL_OPTIMIZATION,
                ],
            },
            {
                version: "2021.8.7",
                changes: [
                    Changelog.UI,
                    Changelog.library(Library.PAX_LOGGING),
                    Changelog.GENERAL_OPTIMIZATION + " an Beta-Version für Anbindung an MQTT-Broker",
                ],
            },
            {
                version: "2021.8.6",
                changes: [
                    Changelog.UI,
                ],
            },
            {
                version: "2021.8.5",
                changes: [
                    Changelog.BACKEND + "Login und Session-Handling",
                    Changelog.library(Library.GUAVA, Library.RETROFIT, Library.POSTGRESQL, Library.FASTEXCEL),
                ],
            },
            {
                version: "2021.8.4",
                changes: [
                    "Beta-Version für Anbindung an MQTT-Broker",
                    Changelog.product(Product.HOME_10) + Changelog.GENERAL_OPTIMIZATION,
                ],
            },
            {
                version: "2021.8.3",
                changes: [
                    Changelog.BACKEND,
                ],
            },
            {
                version: "2021.8.2",
                changes: [
                    Changelog.GENERAL_OPTIMIZATION,
                ],
            },
            {
                version: "2021.8.1",
                changes: [
                    Changelog.openems("2021.8.0"),
                    Changelog.EDGE,
                    Changelog.UI,
                    Changelog.library(Library.GRADLE),
                ],
            },
            {
                version: "2021.7.8",
                changes: [
                    Changelog.EDGE,
                ],
            },
            {
                version: "2021.7.7",
                changes: [
                    Changelog.UI + "Information zum Gesamtsystemstatus",
                ],
            },
            {
                version: "2021.7.6",
                changes: [
                    Changelog.BACKEND,
                    Changelog.library(Library.NGX_COOKIE_SERVICE),
                ],
            },
            {
                version: "2021.7.5",
                changes: [
                    Changelog.product(Product.HOME_10) + Changelog.GENERAL_OPTIMIZATION + " an Batteriewechselrichter-Implementierung (adaptive Berechnung maximalen AC-Leistung)",
                ],
            },
            {
                version: "2021.7.4",
                changes: [
                    Changelog.UI,
                ],
            },
            {
                version: "2021.7.3",
                changes: [
                    Changelog.UI,
                    Changelog.product(Product.COMMERCIAL_30, Product.COMMERCIAL_50) + Changelog.BATTERY_PROTECTION,
                    Changelog.GENERAL_OPTIMIZATION + " bei Konfigurationsänderungen über das Online-Monitoring",
                ],
            },
            {
                version: "2021.7.2",
                changes: [
                    Changelog.BACKEND,
                    Changelog.product(Product.HOME_10) + Changelog.BATTERY_PROTECTION,
                ],
            },
            {
                version: "2021.7.1",
                changes: [
                    Changelog.openems("2021.7.0"),
                    Changelog.UI,
                    Changelog.product(Product.PRO_HYBRID_10) + "Verarbeitung von Authentifizierungsfehlern, Seriennummern und adaptive Berechnung der Maximalleistung",
                    Changelog.product(Product.HOME_10, Product.COMMERCIAL_30, Product.COMMERCIAL_50) + Changelog.BATTERY_PROTECTION,
                    Changelog.product(Product.COMMERCIAL_30, Product.COMMERCIAL_50) + "Adaptive Berechnung der Kapazität (für Variante 'Single B')",
                    "Refactoring des ESS Linear Power Band Controller ('Controller.Ess.LinearPowerBand')",
                    Changelog.BACKEND,
                    Changelog.library(Library.ANGULAR, Library.IONIC, Library.DATE_FNS, Library.MYDATEPICKER, Library.D3, Library.NGX_FORMLY, Library.NG2_CHARTS, Library.NGX_SPINNER,
                        Library.HIKARI_CP, Library.ECLIPSE_OSGI, Library.APACHE_FELIX_HTTP_JETTY, Library.JNA, Library.MOSHI, Library.JAVA_WEBSOCKET),
                ],
            },
            { //
                version: "2021.6.2",
                changes: [
                    "Online-Monitoring: Produktinformation über das " + Changelog.link("Heimatstrom", "https://regionalwerke.com/pv/reststrom") + "-Angebot der Regionalwerke",
                ],
            },
            {
                version: "2021.6.1",
                changes: [
                    Changelog.openems("2021.6.0"),
                ],
            },
            {
                version: "2021.5.2",
                changes: [
                    Changelog.UI,
                    Changelog.library(Library.FASTEXCEL),
                    Changelog.product(Product.HOME_10) + Changelog.GENERAL_OPTIMIZATION + " an Batterie-Implementierung (adaptive Berechnung der Kapazität)",
                ],
            },
            {
                version: "2021.5.1",
                changes: [
                    Changelog.openems("2021.5.0"),
                    Changelog.BACKEND,
                    Changelog.library(Library.ANGULAR, Library.IONIC),
                    Changelog.GENERAL_OPTIMIZATION + " an OneWire-Implementierung",
                    "Optimierungen an der lokalen Zeitreihendatenbank ('RRD4j')",
                ],
            },
            {
                version: "2021.4.16",
                changes: [
                    "Performance-Optimierung am Backend für das Online-Monitoring",
                ],
            },
            {
                version: "2021.4.15",
                changes: [
                    "Performance-Optimierung am Backend für das Online-Monitoring",
                ],
            },
            {
                version: "2021.4.14",
                changes: [
                    Changelog.product(Product.HOME_10) + Changelog.GENERAL_OPTIMIZATION + " an Batteriewechselrichter- und Batterie-Implementierung",
                ],
            },
            {
                version: "2021.4.13",
                changes: [
                    "Implementierung des FEMS-Relais 4-Kanal",
                    Changelog.product(Product.HOME_10) + Changelog.GENERAL_OPTIMIZATION + " an Batteriewechselrichter- und Batterie-Implementierung",
                    Changelog.GENERAL_OPTIMIZATION + " bei Konfigurationsänderungen über das Online-Monitoring",
                ],
            },
            {
                version: "2021.4.12",
                changes: [
                    Changelog.product(Product.COMMERCIAL_30, Product.COMMERCIAL_50) + "Fehlerbehebung bei Aufzeichnung der Zelltemperaturen",
                    "Optimierung der Anbindung an den Backend-Server ('Controller.Backend.Api')",
                ],
            },
            {
                version: "2021.4.11",
                changes: [
                    Changelog.product(Product.PRO_HYBRID_10) + "Verbesserung der Fehlermeldung bei Kommunikationsabbruch",
                    "Optimierung der Anbindung an den Backend-Server ('Controller.Backend.Api')",
                ],
            },
            {
                version: "2021.4.10",
                changes: [
                    "Optimierung der Anbindung an den Backend-Server ('Controller.Backend.Api')",
                ],
            },
            {
                version: "2021.4.9",
                changes: [
                    Changelog.BACKEND,
                ],
            },
            {
                version: "2021.4.8",
                changes: [
                    Changelog.UI,
                    Changelog.BACKEND,
                    "Optimierung der Anbindung an den Backend-Server ('Controller.Backend.Api')",
                    Changelog.product(Product.COMMERCIAL_30, Product.COMMERCIAL_50) + Changelog.BATTERY_PROTECTION,
                ],
            },
            {
                version: "2021.4.7",
                changes: [
                    Changelog.BACKEND,
                ],
            },
            {
                version: "2021.4.6",
                changes: [
                    Changelog.BACKEND,
                ],
            },
            {
                version: "2021.4.5",
                changes: [
                    Changelog.BACKEND,
                ],
            },
            {
                version: "2021.4.4",
                changes: [
                    Changelog.BACKEND,
                ],
            },
            {
                version: "2021.4.3",
                changes: [
                    Changelog.BACKEND,
                ],
            },
            {
                version: "2021.4.2",
                changes: [
                    "Optimierungen an der lokalen Zeitreihendatenbank ('RRD4j')",
                    "Optimierung der Anbindung an den Backend-Server ('Controller.Backend.Api')",
                ],
            },
            {
                version: "2021.4.1",
                changes: [
                    Changelog.openems("2021.4.0"),
                ],
            },
            {
                version: "2021.3.4",
                changes: [
                    Changelog.product(Product.COMMERCIAL_30, Product.COMMERCIAL_50) + Changelog.BATTERY_PROTECTION,
                ],
            },
            {
                version: "2021.3.3",
                changes: [
                    Changelog.GENERAL_OPTIMIZATION,
                ],
            },
            {
                version: "2021.3.2",
                changes: [
                    Changelog.GENERAL_OPTIMIZATION,
                    { roleIsAtLeast: Role.ADMIN, change: "Service-Assistent für Soltaro-Batterien Version C" },
                ],
            },
            {
                version: "2021.3.1",
                changes: [
                    Changelog.openems("2021.3.0"),
                    Changelog.product(Product.INDUSTRIAL_M) + Changelog.GENERAL_OPTIMIZATION + " für BMW i3-Batterien",
                    Changelog.library(Library.FASTEXCEL, Library.ECLIPSE_OSGI, Library.APACHE_FELIX_METATYPE, Library.ANGULAR, Library.DATE_FNS),
                    "Kundeninformation über mögliches Update der BYD Battery Box Premium HVS",
                ],
            },
            {
                version: "2021.2.1",
                changes: [
                    Changelog.openems("2021.2.0"),
                    Changelog.library(Library.FASTEXCEL, Library.HIKARI_CP),
                    { roleIsAtLeast: Role.ADMIN, change: "Service-Assistent für Soltaro-Batterien" },
                ],
            },
            {
                version: "2021.1.13",
                changes: [
                    Changelog.product(Product.HOME_10, Product.COMMERCIAL_30, Product.COMMERCIAL_50) + Changelog.BATTERY_PROTECTION,
                ],
            },
            {
                version: "2021.1.12",
                changes: [
                    Changelog.product(Product.COMMERCIAL_50) + "Stabilitätsverbesserung bei Kommunikationsabbruch",
                ],
            },
            {
                version: "2021.1.11",
                changes: [
                    Changelog.app(App.PV_INVERTER, App.KACO) + "Korrektor von Rundungsfehlern bei der Vorgabe von Set-Points",
                    Changelog.product(Product.COMMERCIAL_50) + "Korrektor von Rundungsfehlern bei der Vorgabe von Set-Points",
                ],
            },
            {
                version: "2021.1.10",
                changes: [
                    Changelog.GENERAL_OPTIMIZATION,
                ],
            },
            {
                version: "2021.1.9",
                changes: [
                    Changelog.product(Product.COMMERCIAL_30, Product.COMMERCIAL_50) + Changelog.GENERAL_OPTIMIZATION,
                ],
            },
            {
                version: "2021.1.8",
                changes: [
                    Changelog.product(Product.COMMERCIAL_30, Product.COMMERCIAL_50) + Changelog.BATTERY_PROTECTION,
                ],
            },
            {
                version: "2021.1.7",
                changes: [
                    Changelog.BACKEND,
                ],
            },
            {
                version: "2021.1.6",
                changes: [
                    Changelog.product(Product.COMMERCIAL_30, Product.COMMERCIAL_50) + "Fehlerbehebung bei Aufzeichnung der Zelltemperaturen",
                    Changelog.BACKEND,
                ],
            },
            {
                version: "2021.1.5",
                changes: [
                    Changelog.product(Product.COMMERCIAL_50) + "Korrektur der Anzeige im Monitoring bei manuellem Stop des Batteriewechselrichters",
                    Changelog.UI,
                ],
            },
            {
                version: "2021.1.4",
                changes: [
                    Changelog.app(App.EVCS_AC, App.KEBA) + "Aufzeichnung der Energiedaten zur E-Auto-Beladung",
                ],
            },
            {
                version: "2021.1.3",
                changes: [
                    "Stabilitätsverbesserung bei Kommunikationsabbruch zu Peripheriegeräten",
                ],
            },
            {
                version: "2021.1.2",
                changes: [
                    Changelog.BACKEND,
                ],
            },
            {
                version: "2021.1.1",
                changes: [
                    Changelog.openems("2021.1.0"),
                ],
            },
        ];


    protected slice: number = 10;
    protected showAll: boolean = false;
    constructor(
        public translate: TranslateService,
        public service: Service,
        private route: ActivatedRoute,
    ) { }

    public numberToRole(role: number): string {
        return Role[role].toLowerCase();
    }
}
