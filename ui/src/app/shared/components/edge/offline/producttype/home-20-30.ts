import { Component, ChangeDetectionStrategy } from "@angular/core";
import { environment } from "src/environments";
import { ManualComponent, OfflineStep } from "./default";

@Component({
    selector: "oe-manual-home-20-30",
    templateUrl: "./offline-template.html",
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false,
})
export class Home2030ManualComponent extends ManualComponent {
    protected override steps: OfflineStep[] = [
        {
            header: this.translate.instant("OFFLINE.DEFAULT.STEP_EMS_RESTART.HEADER", {
                edgeShortName: environment.edgeShortName,
            }),
            description: this.translate.instant("OFFLINE.HOME_20_30.STEP_EMS_RESTART.DESCRIPTION", {
                edgeShortName: environment.edgeShortName,
                edgeLongName: environment.edgeLongName,
            }),
        },
        {
            header: this.translate.instant("OFFLINE.GENERAL.STEP_TEST_WIFI_CONNECTION.HEADER", {
                edgeShortName: environment.edgeShortName,
            }),
            description: this.translate.instant("OFFLINE.GENERAL.STEP_TEST_WIFI_CONNECTION.DESCRIPTION", {
                edgeShortName: environment.edgeShortName,
            }),
            children: [
                {
                    header: this.translate.instant("OFFLINE.GENERAL.STEP_TEST_WIFI_CONNECTION.CHILD_1.HEADER"),
                    description: this.translate.instant(
                        "OFFLINE.GENERAL.STEP_TEST_WIFI_CONNECTION.CHILD_1.DESCRIPTION",
                    ),
                },
                {
                    header: this.translate.instant("OFFLINE.GENERAL.STEP_TEST_WIFI_CONNECTION.CHILD_2.HEADER"),
                    description: this.translate.instant(
                        "OFFLINE.GENERAL.STEP_TEST_WIFI_CONNECTION.CHILD_2.DESCRIPTION",
                    ),
                },
            ],
        },
        {
            header: this.translate.instant("OFFLINE.DEFAULT.STEP_FIREWALL.HEADER", {
                edgeShortName: environment.edgeShortName,
            }),
            description: ManualComponent.FIREWALL_DESCRIPTION(this.service, this.translate),
        },
    ];
}
