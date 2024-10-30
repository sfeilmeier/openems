import { Component, Input } from "@angular/core";
import { Role } from "src/app/shared/type/role";
import { environment } from "src/environments";

export interface OfflineStep {
    header: string,
    description: string,
    children?: OfflineStep[]
}

export namespace OfflineConstants {

    export const STEP_TEST_WIFI_CONNECTION: OfflineStep = {
        header: "Routerverbindung mit Laptop überprüfen",
        description: `
        <p>a) Stecken Sie das LAN-Kabel von der Home-${environment.edgeShortName} Box („LAN“ Schnittstelle) ab und schließen Sie
        dieses an einem Laptop/PC an (Achtung: WLAN Adapter ausschalten).
        Wenn der Laptop/PC erfolgreich eine Internetverbindung aufbauen konnte, gehen Sie weiter zu
        Schritt 3, ansonsten weiter zu b.</p>
        <p>b) Wenn der Laptop/PC keine Internetverbindung aufbaut, schließen Sie das Gerät bitte direkt
        per LAN-Kabel am Router an,
        um die Funktionalität des Routers sicherzustellen
        (also ohne zusätzliche Kabelstrecke und ohne weitere Netzwerkteilnehmer dazwischen).</p>
        <p> → Wenn die Funktionalität des Routers sichergestellt ist, leitet das LAN-Kabel,
        ein WLAN Repeater oder ein Powerline Adapter das Signal vermutlich nicht korrekt weiter.
        In diesem Fall finden Sie in den produktspezifischen Anleitungen des jeweiligen Herstellers
        weitere Informationen.</p>
        `,
    };

    export const STEP_EMS_RESTART: OfflineStep = {
        header: `${environment.edgeShortName} neu starten`,
        description: `Im Anschlussbereich des FENECON Home Stromspeichersystems befindet sich ein blauer
        Steckverbinder.
        Dieser versorgt das ${environment.edgeShortName} (${environment.edgeLongName}) mit einer Hilfsversorgung.
        Ziehen Sie den Stecker heraus und stecken ihn nach 10 Sekunden wieder ein, um das ${environment.edgeShortName} neu zu starten.
        Warten Sie anschließend einige Minuten und aktualisieren Sie das Browser-Fenster.
        Die Fehlermeldung sollte anschließend verschwunden sein und das Online-Monitoring wieder
        sichtbar.
        Falls dies nicht der Fall ist, gehen Sie weiter zu Schritt 2.`,
    };

    export const STEP_FIREWALL: OfflineStep = {
        header: "Portfreigabe/Firewall prüfen", description: `
        Einstellungen der Firewall können die Internet-Verbindung zum ${environment.edgeShortName}
        begrenzen. Besonders bei Erstinbetriebnahmen ist dies häufig der Fall. Bitte
        überprüfen Sie mithilfe der <a href="https://docs.fenecon.de/de/fems/ui/introduction.html#_offlinelokal" target="_blank">Anleitung</a> die Ports und Dienste, die auf dem
        ${environment.edgeShortName} aktiv sind.
        `,
    };

    export const STEP_SERVICE: OfflineStep = {
        header: "FENECON Service", description: `
        Sofern Sie alle vorhergehenden Punkte bereits überprüft haben, und das
        Online-Monitoring weiterhin keine Daten anzeigt, können Sie sich an unseren
        Service wenden:<br>Per Mail: <a href="mailto:service&#64;fenecon.de">service&#64;fenecon.de</a> oder telefonisch unter:
        +49 9903 6280-0 (Mo. - Do. 8 - 12 | 13 - 17 Uhr | Fr. 8 - 12 | 13 - 15 Uhr)
        `,
    };

    export const STEP_CONTACT_INSTALLER: OfflineStep = {
        header: "Installateur kontaktieren",
        description: `Sofern Sie alle vorhergehenden Punkte bereits überprüft haben, und das Online-Monitoring weiterhin keine Daten anzeigt, bitten wir Sie sich
        mit Ihrem <b>Installateur</b> in Verbindung zu setzen.`,
    };

    export function getRoleSpecificSteps(role?: Role): OfflineStep[] {
        const steps: OfflineStep[] = [];
        if (role == null) {
            return [];
        }

        if (Role.isAtLeast(role, Role.INSTALLER)) {
            steps.push(OfflineConstants.STEP_SERVICE);
        } else {
            steps.push(OfflineConstants.STEP_CONTACT_INSTALLER);
        }
        return steps;
    }
}

@Component({
    selector: "oe-offline-default",
    templateUrl: "./offline-template.html",
})
export class DefaultOfflineComponent {

    protected readonly steps: OfflineStep[] = ([
        OfflineConstants.STEP_EMS_RESTART,
        OfflineConstants.STEP_TEST_WIFI_CONNECTION,
        OfflineConstants.STEP_FIREWALL,
    ]);

    @Input() set role(value: Role) {
        this.steps.push(...OfflineConstants.getRoleSpecificSteps(value));
    }
}
