import { Component, Input } from "@angular/core";
import { Role } from "src/app/shared/type/role";
import { environment } from "src/environments";
import { OfflineConstants, OfflineStep } from "./default";

@Component({
    selector: "oe-offline-home-10",
    templateUrl: "./offline-template.html",
})
export class Home10OfflineComponent {

    private static readonly STEP_EMS_RESTART: OfflineStep = {
        header: `${environment.edgeShortName} neu starten und LAN-Stecker prüfen`, description: `
                An der obersten Box des Speicherturms, befindet sich ein Kaltgerätestecker
                (schwarz-blau). Stecken Sie diesen aus und warten Sie 15 Sekunden ab.
                Stecken Sie den Kaltgerätstecker wieder ein und warten Sie nun
                <b>
                    5 - 10 Minuten
                </b>
                (das System startet neu). Stellen Sie außerdem sicher, dass
                der LAN-Stecker akkurat in der ${environment.edgeShortName}-Anschlussbox steckt. Aktualisieren Sie
                nun das Browser-Fenster des Online-Monitorings: War diese Maßnahme
                erfolgreich, sollte die Fehlermeldung nun aufgehoben sein und die gewohnte
                Ansicht des Online-Monitorings wie gewohnt zu sehen sein.`,
    };

    private static readonly STEP_TEST_WIFI_CONNECTION: OfflineStep = {
        header: "Internetverbindung prüfen",
        description: `Anschließend können Sie die Router-Funktion testen, 
            indem Sie an der Anschlussbox der ${environment.edgeShortName} Box den LAN-Stecker ausstecken und mit einem Laptop oder PC anschließen. 
            Bitte beachten: An diesem Gerät die WLAN-Verbindung trennen.`,
        children: [{
            header: "-> weiterhin keine Internetverbindung",
            description: `Schließen Sie das Endgerät (Laptop oder PC) direkt per LAN-Kabel - ohne zusätzliche Kabelstrecke oder 
                dazwischen geschaltene Netzwerkteilnehmeram - Router an, um die Funktionalität des Routers sicherzustellen (Bsp. Wlanverstärker, Switches). 
                Wenn wiederum keine Internetverbindung hergestellt werden konnte, bitten wir Sie der produktspezifischen Anleitung 
                des jeweiligen Herstellers der Netzwerkteilnehmer Folge zu leisten und dort weitere Informationen einzuholen.`,
        },
        {
            header: "-> Internet mit Laptop aufgebaut",
            description: "weiter zu \"3. Portfreigabe/Firewall prüfen\"",
        }],
    };

    protected readonly steps: OfflineStep[] = [
        Home10OfflineComponent.STEP_EMS_RESTART,
        Home10OfflineComponent.STEP_TEST_WIFI_CONNECTION,
        OfflineConstants.STEP_FIREWALL,
    ];

    @Input() set role(value: Role) {
        this.steps.push(...OfflineConstants.getRoleSpecificSteps(value));
    }
}
