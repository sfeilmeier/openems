import { Component, Input } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Role } from "src/app/shared/type/role";
import { environment } from "src/environments";

export interface OfflineStep {
    header: string;
    description: string;
    children?: OfflineStep[];
}

@Component({
    selector: "oe-manual-default",
    templateUrl: "./offline-template.html",
    standalone: false,
})
export class ManualComponent {

    protected steps: OfflineStep[] = [
        {
            header: this.translate.instant("OFFLINE.HOME_10.STEP_EMS_RESTART.HEADER", { edgeShortName: environment.edgeShortName }),
            description: this.translate.instant("OFFLINE.STEP_EMS_RESTART.DESCRIPTION", { edgeShortName: environment.edgeShortName }),
        },
        {
            header: this.translate.instant("OFFLINE.DEFAULT.STEP_TEST_WIFI_CONNECTION.HEADER"),
            description: this.translate.instant("OFFLINE.DEFAULT.STEP_TEST_WIFI_CONNECTION.DESCRIPTION", { edgeShortName: environment.edgeShortName, edgeLongName: environment.edgeLongName }),
        },
        {
            header: this.translate.instant("OFFLINE.DEFAULT.STEP_FIREWALL.HEADER"),
            description: this.translate.instant("OFFLINE.DEFAULT.STEP_FIREWALL.DESCRIPTION", { edgeShortName: environment.edgeShortName }),
        }];

    constructor(protected translate: TranslateService) { }

    @Input() set role(value: Role) {
        const roleSpecificStep = this.getRoleSpecificSteps(value);
        if (roleSpecificStep) {
            this.steps.push(roleSpecificStep);
        }
    }

    protected getRoleSpecificSteps(role?: Role): OfflineStep | undefined {
        if (role === null || role === undefined) {
            return undefined;
        }

        if (Role.isAtLeast(role, Role.INSTALLER)) {
            return {
                header: this.translate.instant("OFFLINE.DEFAULT.STEP_SERVICE.HEADER"),
                description: this.translate.instant("OFFLINE.DEFAULT.STEP_SERVICE.DESCRIPTION"),
            };
        }

        return {
            header: this.translate.instant("OFFLINE.DEFAULT.STEP_CONTACT_INSTALLER.HEADER"),
            description: this.translate.instant("OFFLINE.DEFAULT.STEP_CONTACT_INSTALLER.DESCRIPTION"),
        };
    }
}
