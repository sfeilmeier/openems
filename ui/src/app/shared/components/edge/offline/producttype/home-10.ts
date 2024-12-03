import { Component } from "@angular/core";
import { environment } from "src/environments";
import { ManualComponent } from "./default";

export interface OfflineStep {
    header: string;
    description: string;
    children?: OfflineStep[];
}

@Component({
    selector: "oe-manual-home-10",
    templateUrl: "./offline-template.html",
})
export class Home10ManualComponent extends ManualComponent {

    protected override steps: OfflineStep[] = [{
        header: this.translate.instant("OFFLINE.DEFAULT.STEP_EMS_RESTART.HEADER", { edgeShortName: environment.edgeShortName }),
        description: this.translate.instant("OFFLINE.HOME_10.STEP_EMS_RESTART.DESCRIPTION", { edgeShortName: environment.edgeShortName }),
    }, {
        header: this.translate.instant("OFFLINE.GENERAL.STEP_TEST_WIFI_CONNECTION.HEADER", { edgeShortName: environment.edgeShortName }),
        description: this.translate.instant("OFFLINE.GENERAL.STEP_TEST_WIFI_CONNECTION.DESCRIPTION", { edgeShortName: environment.edgeShortName }),
        children: [
            {
                header: this.translate.instant("OFFLINE.GENERAL.STEP_TEST_WIFI_CONNECTION.CHILD_1.HEADER"),
                description: this.translate.instant("OFFLINE.GENERAL.STEP_TEST_WIFI_CONNECTION.CHILD_1.DESCRIPTION"),
            }, {
                header: this.translate.instant("OFFLINE.GENERAL.STEP_TEST_WIFI_CONNECTION.CHILD_2.HEADER"),
                description: this.translate.instant("OFFLINE.GENERAL.STEP_TEST_WIFI_CONNECTION.CHILD_2.DESCRIPTION"),
            },
        ],
    }, {
        header: this.translate.instant("OFFLINE.DEFAULT.STEP_FIREWALL.HEADER"),
        description: this.translate.instant("OFFLINE.DEFAULT.STEP_FIREWALL.DESCRIPTION", { edgeShortName: environment.edgeShortName }),
    }];
}
